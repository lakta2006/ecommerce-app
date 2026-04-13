"""
User profile endpoints.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, RefreshToken as RefreshTokenModel
from app.schemas.user import UserResponse, UserUpdate, ChangePassword
from app.core.security import verify_password, get_password_hash, validate_password_strength
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["User Profile"])


@router.get("", response_model=UserResponse)
async def get_profile(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Get current user profile information."""
    return current_user


@router.put("", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """Update current user profile."""
    # Update fields if provided
    if user_data.name is not None:
        current_user.name = user_data.name
    if user_data.avatar is not None:
        current_user.avatar = user_data.avatar
    if user_data.role is not None:
        current_user.role = user_data.role.value

    db.commit()
    db.refresh(current_user)

    return current_user


@router.put("/password")
async def change_password(
    password_data: ChangePassword,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """Change current user password."""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Validate new password strength
    is_valid, password_error = validate_password_strength(password_data.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=password_error
        )

    # Prevent reusing the same password
    if verify_password(password_data.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )

    # Update password
    current_user.password_hash = get_password_hash(password_data.new_password)
    
    # Revoke all refresh tokens for this user (force re-login with new password)
    db.query(RefreshTokenModel).filter(
        RefreshTokenModel.user_id == current_user.id
    ).update({"revoked": True})
    
    db.commit()

    return {"message": "Password changed successfully"}
