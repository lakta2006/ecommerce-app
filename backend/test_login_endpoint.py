#!/usr/bin/env python3
"""
Test login endpoint directly without HTTP layer.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.security import OAuth2PasswordRequestForm
from app.database import get_db
from app.api.v1.auth import login
from fastapi import Request

import asyncio

async def test_login_endpoint():
    """Test login endpoint directly."""
    try:
        # Get database session
        db_gen = get_db()
        db = next(db_gen)
        
        # Create form data
        form_data = OAuth2PasswordRequestForm(
            username="lakta.lakta.2026@gmail.com",
            password="Test123!"
        )
        
        # Create a mock request with all required fields for rate limiter
        request = Request({
            "type": "http", 
            "method": "POST", 
            "url": "/api/auth/login",
            "path": "/api/auth/login",
            "scheme": "http",
            "server": ("127.0.0.1", 8000),
            "client": ("127.0.0.1", 12345)
        })
        
        print("Testing login endpoint directly...")
        print(f"Email: {form_data.username}")
        print(f"Password: {form_data.password}")
        
        # Call the login function
        result = await login(request, form_data, db)
        print(f"Login result: {result}")
        
        db.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_login_endpoint())
