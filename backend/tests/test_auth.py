"""
Tests for authentication endpoints.
"""
import pytest
from fastapi import status
from app.models.user import UserRole


def test_register_user(client):
    """Test user registration."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "name": "New User",
            "phone": "+963912345678",
            "password": "Password123!",
            "role": "customer"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"
    assert "id" in data
    assert "password" not in data


def test_register_weak_password(client):
    """Test registration with weak password."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "weakuser@example.com",
            "name": "Weak User",
            "password": "weak"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password" in response.json()["detail"].lower()


def test_register_duplicate_email(client, test_user):
    """Test registration with duplicate email."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "name": "Another User",
            "password": "Password123!"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Email already registered" in response.json()["detail"]


def test_login_success(client, test_user):
    """Test successful login."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "Password123!"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "nonexistent@example.com",
            "password": "Wrongpass123!"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_account_lockout(client, db):
    """Test account lockout after multiple failed attempts."""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    # Create a test user
    user = User(
        email="locktest@example.com",
        name="Lock Test",
        password_hash=get_password_hash("Password123!"),
        role=UserRole.CUSTOMER,
        is_active=True,
    )
    db.add(user)
    db.commit()
    
    # Try 5 failed logins
    for _ in range(5):
        response = client.post(
            "/api/auth/login",
            data={
                "username": "locktest@example.com",
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    # 6th attempt should be locked
    response = client.post(
        "/api/auth/login",
        data={
            "username": "locktest@example.com",
            "password": "Password123!"
        }
    )
    assert response.status_code == status.HTTP_423_LOCKED
    
    # Cleanup
    db.delete(user)
    db.commit()


def test_get_current_user(client, test_user):
    """Test getting current user info."""
    # First login to get token
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "Password123!"
        }
    )
    token = login_response.json()["access_token"]

    # Get current user
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"


def test_get_current_user_unauthorized(client):
    """Test getting current user without authentication."""
    response = client.get("/api/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_refresh_token(client, test_user):
    """Test token refresh."""
    # Login to get tokens
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "Password123!"
        }
    )
    refresh_token = login_response.json()["refresh_token"]

    # Refresh token
    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_forgot_password(client, test_user):
    """Test forgot password request."""
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "test@example.com"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "reset_token" in data  # In production, this won't be returned


def test_reset_password(client, test_user):
    """Test password reset."""
    # First request a reset token
    forgot_response = client.post(
        "/api/auth/forgot-password",
        json={"email": "test@example.com"}
    )
    reset_token = forgot_response.json()["reset_token"]

    # Reset password with strong password
    response = client.post(
        "/api/auth/reset-password",
        json={
            "token": reset_token,
            "new_password": "NewPassword123!"
        }
    )
    assert response.status_code == status.HTTP_200_OK

    # Try logging in with new password
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "NewPassword123!"
        }
    )
    assert login_response.status_code == status.HTTP_200_OK


def test_reset_password_weak_password(client, test_user):
    """Test password reset with weak password."""
    forgot_response = client.post(
        "/api/auth/forgot-password",
        json={"email": "test@example.com"}
    )
    reset_token = forgot_response.json()["reset_token"]

    # Try to reset with weak password
    response = client.post(
        "/api/auth/reset-password",
        json={
            "token": reset_token,
            "new_password": "weak"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_get_profile(client, test_user):
    """Test getting user profile."""
    # Login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "Password123!"
        }
    )
    token = login_response.json()["access_token"]
    
    # Get profile
    response = client.get(
        "/api/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"


def test_update_profile(client, test_user):
    """Test updating user profile."""
    # Login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "Password123!"
        }
    )
    token = login_response.json()["access_token"]

    # Update profile
    response = client.put(
        "/api/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Updated Name"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Name"


def test_change_password(client, test_user):
    """Test changing password."""
    # Login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "Password123!"
        }
    )
    token = login_response.json()["access_token"]

    # Change password with strong password
    response = client.put(
        "/api/profile/password",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "current_password": "Password123!",
            "new_password": "NewPassword456!"
        }
    )
    assert response.status_code == status.HTTP_200_OK

    # Login with new password
    new_login = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "NewPassword456!"
        }
    )
    assert new_login.status_code == status.HTTP_200_OK


def test_change_password_weak_password(client, test_user):
    """Test changing password with weak password."""
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "Password123!"
        }
    )
    token = login_response.json()["access_token"]

    # Try to change to weak password
    response = client.put(
        "/api/profile/password",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "current_password": "Password123!",
            "new_password": "weak"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_token_type_validation(client, test_user):
    """Test that access token cannot be used as refresh token."""
    # Login to get tokens
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "Password123!"
        }
    )
    access_token = login_response.json()["access_token"]

    # Try to use access token as refresh token
    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": access_token}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
