#!/usr/bin/env python3
"""
Test login functionality directly without HTTP.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from app.models.user import User
from app.core.security import verify_password

def test_login_direct():
    """Test login functionality directly."""
    try:
        # Get database session
        db_gen = get_db()
        db = next(db_gen)
        
        # Find the user
        user = db.query(User).filter(User.email == 'lakta.lakta.2026@gmail.com').first()
        
        if not user:
            print("User not found!")
            return
            
        print(f"User found: {user.email}")
        print(f"Is active: {user.is_active}")
        print(f"Password hash: {user.password_hash}")
        
        # Test password verification
        password = "Test123!"
        is_valid = verify_password(password, user.password_hash)
        print(f"Password verification result: {is_valid}")
        
        # Test account lock status
        print(f"Failed attempts: {user.failed_login_attempts}")
        print(f"Locked until: {user.locked_until}")
        print(f"Is locked: {user.is_locked()}")
        
        db.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_login_direct()
