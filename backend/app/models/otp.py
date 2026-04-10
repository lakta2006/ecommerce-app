"""
OTP (One-Time Password) models for email verification and password reset.
"""
from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class EmailVerificationOTP(Base):
    """Email verification OTP model."""

    __tablename__ = "email_verification_otps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", backref="email_verification_otps")

    def is_expired(self) -> bool:
        """Check if OTP has expired."""
        # Handle both timezone-aware and naive datetimes
        now = datetime.utcnow()
        expires_at = self.expires_at
        if expires_at.tzinfo is not None:
            # Convert timezone-aware to naive UTC for comparison
            expires_at = expires_at.replace(tzinfo=None)
        return now > expires_at

    def is_valid(self) -> bool:
        """Check if OTP is still valid (not expired, not used, max attempts not reached)."""
        return not self.used and not self.is_expired() and self.attempts < 5

    @classmethod
    def generate_otp_code(cls) -> str:
        """Generate a 6-digit OTP code."""
        import secrets
        return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

    @classmethod
    def create_otp(cls, user_id: int, email: str, expire_minutes: int = 10) -> "EmailVerificationOTP":
        """Create a new OTP for email verification."""
        otp_code = cls.generate_otp_code()
        expires_at = datetime.utcnow() + timedelta(minutes=expire_minutes)

        return cls(
            user_id=user_id,
            email=email,
            otp_code=otp_code,
            expires_at=expires_at
        )


class PasswordResetOTP(Base):
    """Password reset OTP model."""

    __tablename__ = "password_reset_otps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", backref="password_reset_otps")

    def is_expired(self) -> bool:
        """Check if OTP has expired."""
        now = datetime.utcnow()
        expires_at = self.expires_at
        if expires_at.tzinfo is not None:
            expires_at = expires_at.replace(tzinfo=None)
        return now > expires_at

    def is_valid(self) -> bool:
        """Check if OTP is still valid."""
        return not self.used and not self.is_expired() and self.attempts < 5

    @classmethod
    def generate_otp_code(cls) -> str:
        """Generate a 6-digit OTP code."""
        import secrets
        return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

    @classmethod
    def create_otp(cls, user_id: int, email: str, expire_minutes: int = 10) -> "PasswordResetOTP":
        """Create a new OTP for password reset."""
        otp_code = cls.generate_otp_code()
        expires_at = datetime.utcnow() + timedelta(minutes=expire_minutes)

        return cls(
            user_id=user_id,
            email=email,
            otp_code=otp_code,
            expires_at=expires_at
        )
