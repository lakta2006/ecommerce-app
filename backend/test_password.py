#!/usr/bin/env python3
"""
Test password hashing and verification directly.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import verify_password, get_password_hash

def test_password():
    """Test password hashing and verification."""
    password = "Test123!"
    
    try:
        print("Testing password hashing...")
        hashed = get_password_hash(password)
        print(f"Hashed password: {hashed}")
        
        print("Testing password verification...")
        result = verify_password(password, hashed)
        print(f"Verification result: {result}")
        
        # Test with wrong password
        wrong_result = verify_password("WrongPassword", hashed)
        print(f"Wrong password verification: {wrong_result}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_password()
