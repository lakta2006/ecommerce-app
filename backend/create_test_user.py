#!/usr/bin/env python3
"""
Create a test user account for development/testing.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db, engine
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from sqlalchemy.orm import Session

def create_test_user():
    """Create a test user account."""
    # Get database session
    db_gen = get_db()
    db = next(db_gen)
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == 'lakta.lakta.2026@gmail.com').first()
        if existing_user:
            print(f"User already exists: {existing_user.email}")
            return
        
        # Create a test user with a simpler password
        password = "Test123!"  # Shorter password to avoid bcrypt issues
        hashed_password = get_password_hash(password)
        
        user = User(
            email='lakta.lakta.2026@gmail.com',
            name='Test User',
            password_hash=hashed_password,
            role=UserRole.CUSTOMER,
            is_verified=True,
            is_active=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ Created user: ID={user.id}, Email={user.email}, Name={user.name}")
        print("📝 Login credentials:")
        print(f"   Email: {user.email}")
        print(f"   Password: {password}")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
