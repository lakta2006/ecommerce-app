"""
Authentication schemas.
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from .user import UserRole, UserCreate, UserResponse, UserUpdate


# ============ Authentication Schemas ============

class Token(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded token data."""
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None


# ============ User Login/Register Schemas ============

class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


# Re-export common schemas from user.py
# UserCreate, UserResponse, UserUpdate are already defined in user.py


class ChangePassword(BaseModel):
    """Schema for changing password."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


# ============ Password Reset Schemas ============

class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema for reset password request."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)


# ============ Refresh Token Schemas ============

class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


# ============ OTP Verification Schemas ============

class SendOTPRequest(BaseModel):
    """Schema for sending OTP."""
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    """Schema for verifying OTP."""
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)


class ResendOTPRequest(BaseModel):
    """Schema for resending OTP."""
    email: EmailStr


class OTPResponse(BaseModel):
    """Response for OTP-related operations."""
    message: str
    expires_in_seconds: Optional[int] = None
