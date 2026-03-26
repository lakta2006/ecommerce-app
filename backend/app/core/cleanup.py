"""
Database cleanup utilities for expired tokens.
"""
from sqlalchemy.orm import Session
from app.models.user import RefreshToken, PasswordResetToken
from app.core.security import _get_utc_now


def cleanup_expired_tokens(db: Session) -> dict:
    """
    Clean up expired tokens from the database.
    
    This should be run periodically (e.g., daily via cron job).
    
    Returns:
        Dictionary with counts of deleted tokens
    """
    # Delete expired refresh tokens
    expired_refresh_count = db.query(RefreshToken).filter(
        RefreshToken.expires_at < _get_utc_now()
    ).delete(synchronize_session=False)
    
    # Delete used or expired password reset tokens
    expired_reset_count = db.query(PasswordResetToken).filter(
        (PasswordResetToken.used == True) | 
        (PasswordResetToken.expires_at < _get_utc_now())
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {
        "deleted_refresh_tokens": expired_refresh_count,
        "deleted_reset_tokens": expired_reset_count
    }


def cleanup_revoked_tokens(db: Session, older_than_days: int = 7) -> dict:
    """
    Clean up revoked refresh tokens older than specified days.
    
    Args:
        db: Database session
        older_than_days: Only delete tokens revoked older than this many days
    
    Returns:
        Dictionary with count of deleted tokens
    """
    from datetime import timedelta
    
    cutoff_date = _get_utc_now() - timedelta(days=older_than_days)
    
    deleted_count = db.query(RefreshToken).filter(
        RefreshToken.revoked == True,
        RefreshToken.created_at < cutoff_date
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {"deleted_revoked_tokens": deleted_count}
