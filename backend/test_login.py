#!/usr/bin/env python3
"""
Test login functionality directly.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import requests
import json

def test_login():
    """Test the login endpoint."""
    url = "http://127.0.0.1:8000/api/auth/login"
    
    # OAuth2 password flow expects form data
    data = {
        "username": "lakta.lakta.2026@gmail.com",
        "password": "Test123!"
    }
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        print(f"Testing login with email: {data['username']}")
        response = requests.post(url, data=data, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("Login successful!")
            print(f"Response: {response.json()}")
        else:
            print("Login failed!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error during login test: {e}")

if __name__ == "__main__":
    test_login()
