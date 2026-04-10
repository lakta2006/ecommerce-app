"""
User models for authentication and authorization.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    CUSTOMER = "customer"
    STORE_OWNER = "store_owner"
    MALL_OWNER = "mall_owner"
    ADMIN = "admin"


class User(Base):
    """User model for authentication and authorization."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)

    # Profile
    name = Column(String(100), nullable=False)
    avatar = Column(Text, nullable=True)

    # Role and permissions
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER, nullable=False)

    # Verification and status
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Account lockout for failed login attempts
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"

    def is_locked(self) -> bool:
        """Check if account is currently locked."""
        if self.locked_until is None:
            return False
        return datetime.utcnow() < self.locked_until

    def record_failed_login(self, max_attempts: int = 5, lockout_minutes: int = 30) -> None:
        """Record a failed login attempt and lock account if max attempts reached."""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= max_attempts:
            from datetime import timedelta, timezone
            self.locked_until = datetime.now(timezone.utc) + timedelta(minutes=lockout_minutes)

    def record_successful_login(self) -> None:
        """Reset failed login attempts after successful login."""
        self.failed_login_attempts = 0
        self.locked_until = None


class PasswordResetToken(Base):
    """Token for password reset functionality."""

    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", backref="password_reset_tokens")


class RefreshToken(Base):
    """Refresh token for JWT token refresh functionality."""

    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(500), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", backref="refresh_tokens")
