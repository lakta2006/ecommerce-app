"""
User schemas.
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration for schemas."""
    CUSTOMER = "customer"
    STORE_OWNER = "store_owner"
    MALL_OWNER = "mall_owner"
    ADMIN = "admin"


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s-]{8,20}$')


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s-]{8,20}$')
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.CUSTOMER


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s-]{8,20}$')
    avatar: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response."""
    model_config = {"from_attributes": True}
    
    id: int
    role: UserRole
    is_verified: bool
    is_active: bool
    avatar: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None


class ChangePassword(BaseModel):
    """Schema for changing password."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
