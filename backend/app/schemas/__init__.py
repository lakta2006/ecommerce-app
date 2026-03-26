"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration for schemas."""
    CUSTOMER = "customer"
    STORE_OWNER = "store_owner"
    MALL_OWNER = "mall_owner"
    ADMIN = "admin"


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


# ============ User Schemas ============

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s-]{8,20}$')


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.CUSTOMER


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s-]{8,20}$')
    avatar: Optional[str] = None


class UserChangePassword(BaseModel):
    """Schema for changing password."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


class UserResponse(UserBase):
    """Schema for user response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    role: UserRole
    is_verified: bool
    is_active: bool
    avatar: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


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
