"""
Authentication endpoints.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from slowapi import Limiter
from app.database import get_db
from app.models.user import User, UserRole, RefreshToken as RefreshTokenModel, PasswordResetToken
from app.models.otp import EmailVerificationOTP, PasswordResetOTP
from app.schemas.auth import (
    Token,
    UserCreate,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
    SendOTPRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    OTPResponse,
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_password_reset_token,
    _get_utc_now,
    validate_password_strength,
)
from fastapi import APIRouter, Request
from app.core.dependencies import get_current_user
from app.core.rate_limiter import limiter
from app.core.email_service import email_service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _get_limiter() -> Limiter:
    """Get limiter instance from app state."""
    from app.main import app
    return app.state.limiter


def _invalidate_existing_otps(db: Session, user_id: int) -> None:
    """Invalidate all existing unused OTPs for a user."""
    db.query(EmailVerificationOTP).filter(
        EmailVerificationOTP.user_id == user_id,
        EmailVerificationOTP.used == False
    ).update({"used": True})


def _create_and_send_otp(db: Session, user: User) -> EmailVerificationOTP:
    """Create a new OTP and send it via email."""
    # Invalidate existing OTPs
    _invalidate_existing_otps(db, user)

    # Create new OTP
    otp = EmailVerificationOTP.create_otp(
        user_id=user.id,
        email=user.email,
        expire_minutes=settings.OTP_EXPIRE_MINUTES
    )

    db.add(otp)
    db.commit()
    db.refresh(otp)

    # Send email
    email_service.send_otp_email(
        to_email=user.email,
        otp_code=otp.otp_code,
        user_name=user.name,
        expire_minutes=settings.OTP_EXPIRE_MINUTES
    )

    return otp


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(
   request: Request,
    user_data: UserCreate,
    db: Annotated[Session, Depends(get_db)]
):
    """Register a new user account."""
    # Validate password strength
    is_valid, password_error = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=password_error
        )

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if phone already exists (if provided)
    if user_data.phone:
        existing_phone = db.query(User).filter(User.phone == user_data.phone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        password_hash=hashed_password,
        role=user_data.role,
        is_verified=False,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)]
):
    """Login and get access token."""
    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()

    # Check if account is locked
    if user and user.is_locked():
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Account is locked due to too many failed attempts. Try again after {user.locked_until}",
        )

    if not user or not verify_password(form_data.password, user.password_hash):
        # Record failed login attempt if user exists
        if user:
            user.record_failed_login(max_attempts=5, lockout_minutes=30)
            db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    # Record successful login (reset failed attempts)
    user.record_successful_login()
    
    # Update last login
    user.last_login = _get_utc_now()
    db.commit()

    # Create tokens
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value}
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )

    # Store refresh token in database
    db_refresh_token = RefreshTokenModel(
        user_id=user.id,
        token=refresh_token,
        expires_at=_get_utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    db.add(db_refresh_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    token_data: RefreshTokenRequest
):
    """Logout user by revoking refresh token."""
    if token_data.refresh_token:
        # Find and revoke the refresh token
        db_token = db.query(RefreshTokenModel).filter(
            RefreshTokenModel.token == token_data.refresh_token,
            RefreshTokenModel.user_id == current_user.id
        ).first()

        if db_token:
            db_token.revoked = True
            db.commit()

    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: RefreshTokenRequest,
    db: Annotated[Session, Depends(get_db)]
):
    """Refresh access token using refresh token."""
    # Decode and validate refresh token (must be refresh type)
    decoded = decode_token(token_data.refresh_token, expected_type="refresh")
    if decoded is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if token exists in database and is not revoked
    db_token = db.query(RefreshTokenModel).filter(
        RefreshTokenModel.token == token_data.refresh_token,
        RefreshTokenModel.revoked == False
    ).first()

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user
    user = db.query(User).filter(User.id == decoded.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create new tokens
    new_access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value}
    )
    new_refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )

    # Use atomic operation: revoke old token and store new one in same transaction
    db_token.revoked = True
    db_new_token = RefreshTokenModel(
        user_id=user.id,
        token=new_refresh_token,
        expires_at=_get_utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(db_new_token)
    db.commit()

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/forgot-password")
@limiter.limit("3/hour")
async def forgot_password(
    request: Request,
    request_data: ForgotPasswordRequest = Body(...),
    db: Annotated[Session, Depends(get_db)] = None
):
    """Request a password reset OTP code."""
    logger.info(f"Forgot password request for email: {request_data.email}")
    
    user = db.query(User).filter(User.email == request_data.email).first()

    if not user:
        # Don't reveal if email exists or not
        logger.info(f"No user found with email: {request_data.email}")
        return {"message": "If the email exists, a verification code has been sent"}

    # Invalidate any existing unused password reset OTPs for this user
    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.user_id == user.id,
        PasswordResetOTP.used == False
    ).update({"used": True})
    db.commit()

    # Generate OTP code
    otp_code = PasswordResetOTP.generate_otp_code()
    
    # Calculate expiration time (10 minutes from now)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
    
    logger.info(f"Generated password reset OTP for user {user.id}, expires at: {expires_at} UTC")

    # Store OTP in database
    db_otp = PasswordResetOTP(
        user_id=user.id,
        email=user.email,
        otp_code=otp_code,
        expires_at=expires_at
    )
    db.add(db_otp)
    db.commit()

    # Send email with OTP code
    email_sent = False
    try:
        from app.core.email_service import email_service

        # Log email service configuration for debugging
        logger.info(f"Email service SMTP host: {email_service.smtp_host}")
        logger.info(f"Email service SMTP port: {email_service.smtp_port}")
        logger.info(f"Email service username: {email_service.smtp_username}")

        if not email_service.smtp_host:
            logger.warning("SMTP not configured - email will be logged only (DEV mode)")

        subject = "رمز إعادة تعيين كلمة المرور - لقطة"

        # HTML email with OTP code
        html_content = f"""
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 28px; font-weight: bold; color: #16a34a; }}
                .otp-code {{ background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
                .otp-number {{ font-size: 36px; font-weight: bold; color: #16a34a; letter-spacing: 8px; font-family: monospace; }}
                .info {{ color: #666; font-size: 14px; line-height: 1.6; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🛒 لقطة</div>
                </div>
                <h2>مرحباً {user.name}،</h2>
                <p class="info">
                    لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك. استخدم رمز التحقق التالي لإعادة تعيين كلمة المرور:
                </p>
                <div class="otp-code">
                    <div class="otp-number">{otp_code}</div>
                </div>
                <p class="info">
                    <strong>معلومات مهمة:</strong>
                    <br>
                    • هذا الرمز صالح لمدة {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} دقيقة
                    <br>
                    • إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد
                    <br>
                    • لا تشارك هذا الرمز مع أي شخص
                </p>
                <div class="footer">
                    <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.</p>
                    <p>&copy; {2026} لقطة. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Text fallback
        text_content = f"""
مرحباً {user.name}،

لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك.

رمز إعادة تعيين كلمة المرور الخاص بك هو: {otp_code}

هذا الرمز صالح لمدة {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} دقيقة.

إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.

© {2026} لقطة. جميع الحقوق محفوظة.
        """

        logger.info(f"Attempting to send password reset OTP email to: {user.email}")
        email_sent = email_service.send_email(user.email, subject, html_content, text_content)

        if email_sent:
            logger.info(f"Password reset OTP email sent successfully to {user.email}")
        else:
            logger.error(f"Email service returned False when sending OTP to {user.email}")

    except Exception as e:
        logger.error(f"Exception while sending password reset OTP email: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        email_sent = False

    return {
        "message": "If the email exists, a verification code has been sent",
        "expires_in_minutes": settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
    }


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Annotated[Session, Depends(get_db)]
):
    """Reset password using OTP verification code."""
    # Validate new password strength
    is_valid, password_error = validate_password_strength(request.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=password_error
        )

    # Find the OTP in database
    logger.info(f"Looking for OTP with code: {request.token}")
    db_otp = db.query(PasswordResetOTP).filter(
        PasswordResetOTP.otp_code == request.token,
        PasswordResetOTP.used == False
    ).first()

    if not db_otp:
        logger.warning(f"OTP not found: {request.token}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    logger.info(f"Found OTP for user {db_otp.user_id}, checking expiration...")

    # Check if OTP is expired
    if db_otp.is_expired():
        logger.warning(f"OTP expired: {request.token}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired"
        )

    # Increment attempts
    db_otp.attempts += 1

    # Check max attempts
    if db_otp.attempts > 5:
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please request a new verification code."
        )

    # Update user password
    user = db.query(User).filter(User.id == db_otp.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found or inactive"
        )

    user.password_hash = get_password_hash(request.new_password)
    db_otp.used = True

    # Revoke all refresh tokens for this user (force re-login)
    db.query(RefreshTokenModel).filter(
        RefreshTokenModel.user_id == user.id
    ).update({"revoked": True})

    db.commit()

    return {"message": "Password has been reset successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Get current authenticated user information."""
    return current_user


# ============ OTP Verification Endpoints ============

@router.post("/send-otp", response_model=OTPResponse)
@limiter.limit("5/minute")
async def send_otp(
    request: Request,
    otp_data: SendOTPRequest,
    db: Annotated[Session, Depends(get_db)]
):
    """
    Send OTP to user's email for verification.
    
    This endpoint is used:
    - After registration to verify email
    - To resend OTP if the user didn't receive it
    """
    # Find user by email
    user = db.query(User).filter(User.email == otp_data.email).first()
    
    if not user:
        # Don't reveal if email exists or not (security best practice)
        # But still return success message
        return OTPResponse(
            message="If the email exists, a verification code has been sent",
            expires_in_seconds=settings.OTP_EXPIRE_MINUTES * 60
        )
    
    # Check if user is already verified
    if user.is_verified:
        return OTPResponse(
            message="Email is already verified",
            expires_in_seconds=None
        )
    
    # Check for existing active OTP to enforce cooldown
    existing_otp = db.query(EmailVerificationOTP).filter(
        EmailVerificationOTP.user_id == user.id,
        EmailVerificationOTP.used == False
    ).first()
    
    if existing_otp and not existing_otp.is_expired():
        # Calculate remaining cooldown time
        time_since_created = (datetime.utcnow() - existing_otp.created_at).total_seconds()
        cooldown_remaining = settings.OTP_RESEND_COOLDOWN_SECONDS - time_since_created
        
        if cooldown_remaining > 0:
            return OTPResponse(
                message=f"Please wait {int(cooldown_remaining)} seconds before requesting a new code",
                expires_in_seconds=int(cooldown_remaining)
            )
        
        # Invalidate the old OTP if cooldown has passed
        existing_otp.used = True
        db.commit()
    
    # Create and send new OTP
    otp = _create_and_send_otp(db, user)
    
    # Calculate expiration time in seconds
    expires_in = int((otp.expires_at - datetime.utcnow()).total_seconds())
    
    return OTPResponse(
        message="Verification code sent successfully",
        expires_in_seconds=expires_in
    )


@router.post("/verify-otp", response_model=Token)
@limiter.limit("10/minute")
async def verify_otp(
    request: Request,
    verify_data: VerifyOTPRequest,
    db: Annotated[Session, Depends(get_db)]
):
    """
    Verify OTP code and automatically log in the user.
    
    On successful verification:
    - Marks user as verified
    - Generates JWT tokens
    - Returns tokens for automatic login
    """
    # Find user by email
    user = db.query(User).filter(User.email == verify_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Check if user is already verified
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified. Please login."
        )
    
    # Find valid OTP
    otp = db.query(EmailVerificationOTP).filter(
        EmailVerificationOTP.user_id == user.id,
        EmailVerificationOTP.otp_code == verify_data.otp_code,
        EmailVerificationOTP.used == False
    ).first()
    
    if not otp:
        # Increment failed attempts on user's latest OTP
        latest_otp = db.query(EmailVerificationOTP).filter(
            EmailVerificationOTP.user_id == user.id,
            EmailVerificationOTP.used == False
        ).order_by(EmailVerificationOTP.created_at.desc()).first()
        
        if latest_otp:
            latest_otp.attempts += 1
            
            # Lock out if too many attempts
            if latest_otp.attempts >= 5:
                latest_otp.used = True  # Invalidate OTP
                db.commit()
                
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many failed attempts. Please request a new verification code."
                )
            
            db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Check if OTP is expired
    if otp.is_expired():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new one."
        )
    
    # Mark OTP as used
    otp.used = True
    db.commit()
    
    # Mark user as verified
    user.is_verified = True
    user.last_login = _get_utc_now()
    db.commit()
    
    # Generate tokens for automatic login
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value}
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    # Store refresh token in database
    db_refresh_token = RefreshTokenModel(
        user_id=user.id,
        token=refresh_token,
        expires_at=_get_utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    db.add(db_refresh_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/resend-otp", response_model=OTPResponse)
@limiter.limit("3/minute")
async def resend_otp(
    request: Request,
    resend_data: ResendOTPRequest,
    db: Annotated[Session, Depends(get_db)]
):
    """
    Resend OTP verification code.
    
    This invalidates the previous OTP and sends a new one.
    """
    # Find user by email
    user = db.query(User).filter(User.email == resend_data.email).first()
    
    if not user:
        # Don't reveal if email exists
        return OTPResponse(
            message="If the email exists, a new verification code has been sent",
            expires_in_seconds=settings.OTP_EXPIRE_MINUTES * 60
        )
    
    # Check if user is already verified
    if user.is_verified:
        return OTPResponse(
            message="Email is already verified",
            expires_in_seconds=None
        )
    
    # Invalidate existing OTPs
    _invalidate_existing_otps(db, user.id)
    
    # Create and send new OTP
    otp = _create_and_send_otp(db, user)
    
    # Calculate expiration time in seconds
    expires_in = int((otp.expires_at - datetime.utcnow()).total_seconds())
    
    return OTPResponse(
        message="New verification code sent successfully",
        expires_in_seconds=expires_in
    )
