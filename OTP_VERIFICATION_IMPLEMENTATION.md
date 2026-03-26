# OTP Email Verification Implementation

## Overview

This document describes the production-ready email verification flow with automatic login after verification that has been implemented in the Lakta application.

## Flow Summary

1. **User Registration** → User creates account
2. **OTP Sent** → 6-digit code sent to email
3. **Verification Page** → User redirected to OTP verification
4. **Email Verification** → User enters OTP code
5. **Auto-Login** → JWT tokens generated, user logged in automatically
6. **Redirect to Dashboard** → User redirected to main app

## Backend Changes

### New Files Created

#### 1. `backend/app/models/otp.py`
- `EmailVerificationOTP` model for storing OTP codes
- Fields: `user_id`, `email`, `otp_code`, `expires_at`, `used`, `attempts`, `created_at`
- Methods: `is_expired()`, `is_valid()`, `generate_otp_code()`, `create_otp()`

#### 2. `backend/app/core/email_service.py`
- `EmailService` class for sending emails
- `send_otp_email()` method with HTML email template
- Development mode: logs emails when SMTP not configured

#### 3. `backend/alembic/versions/add_email_otp.py`
- Database migration for OTP table

### Modified Files

#### 1. `backend/app/config.py`
Added new settings:
```python
# Email Configuration
SMTP_HOST: Optional[str] = None
SMTP_PORT: int = 587
SMTP_USERNAME: Optional[str] = None
SMTP_PASSWORD: Optional[str] = None
EMAIL_FROM: str = "noreply@lakta.com"
EMAIL_FROM_NAME: str = "لقطة"

# OTP Settings
OTP_EXPIRE_MINUTES: int = 10
OTP_RESEND_COOLDOWN_SECONDS: int = 60
```

#### 2. `backend/app/schemas/auth.py`
Added OTP schemas:
- `SendOTPRequest`
- `VerifyOTPRequest`
- `ResendOTPRequest`
- `OTPResponse`

#### 3. `backend/app/api/v1/auth.py`
Added new endpoints:
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and auto-login
- `POST /api/auth/resend-otp` - Resend OTP code

### Security Features

1. **Rate Limiting**: All OTP endpoints have rate limits
   - send-otp: 5/minute
   - verify-otp: 10/minute
   - resend-otp: 3/minute

2. **OTP Expiration**: Codes expire after 10 minutes (configurable)

3. **Attempt Limiting**: Max 5 failed attempts before lockout

4. **Cooldown Period**: 60 seconds between resend requests

5. **Email Privacy**: API doesn't reveal if email exists

## Frontend Changes

### Modified Files

#### 1. `frontend/src/types/auth.ts`
Added OTP types:
- `SendOTPData`
- `VerifyOTPData`
- `ResendOTPData`
- `OTPResponse`

#### 2. `frontend/src/services/authService.ts`
Added methods:
- `sendOTP()` - Send OTP request
- `verifyOTP()` - Verify OTP and auto-login
- `resendOTP()` - Resend OTP

#### 3. `frontend/src/stores/authStore.ts`
- Added `verifyOTP()` action
- Modified `login()` to check for email verification
- Modified `register()` to NOT auto-login (requires verification first)

#### 4. `frontend/src/pages/auth/RegisterPage.tsx`
- Sends OTP after registration
- Redirects to `/verify-otp?email=<user-email>`

#### 5. `frontend/src/pages/auth/LoginPage.tsx`
- Detects unverified email error
- Redirects to OTP verification page

#### 6. `frontend/src/pages/auth/OtpVerifyPage.tsx`
- Complete rewrite with real API integration
- Features:
  - 6-digit OTP input with auto-focus
  - Paste support
  - Resend with countdown timer
  - Auto-login after successful verification
  - Redirect to dashboard after verification

### Email Template

The OTP email is styled in Arabic with:
- Professional HTML design
- Brand colors (green theme)
- Clear OTP display
- Expiration information
- Security tips

## Configuration

### Environment Variables (`.env`)

Add to your `backend/.env` file:

```env
# Email Configuration (for OTP and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@lakta.com
EMAIL_FROM_NAME=لقطة

# OTP Settings
OTP_EXPIRE_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
```

### Gmail Setup (for development)

1. Enable 2FA on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password as `SMTP_PASSWORD`

## API Endpoints

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "Verification code sent successfully",
  "expires_in_seconds": 600
}
```

### Verify OTP (Auto-Login)
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

Response:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "New verification code sent successfully",
  "expires_in_seconds": 600
}
```

## User Flow Diagram

```
┌─────────────┐
│  Register   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Send OTP Email │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Verify OTP     │
│  (Enter Code)   │
└──────┬──────────┘
       │
       │ Success
       ▼
┌─────────────────┐
│  Auto-Login     │
│  (JWT Tokens)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Dashboard/     │
│  Profile Page   │
└─────────────────┘
```

## Error Handling

### Common Errors

1. **Invalid OTP Code**
   - Message: "Invalid verification code"
   - Max 5 attempts before temporary lockout

2. **Expired OTP**
   - Message: "Verification code has expired. Please request a new one."
   - User can request new code

3. **Already Verified**
   - Message: "Email is already verified. Please login."
   - Redirect to login

4. **Too Many Requests**
   - Rate limit exceeded
   - Wait before trying again

## Testing

### Manual Testing Steps

1. **Register New User**
   - Go to `/register`
   - Fill in form
   - Submit
   - Should redirect to `/verify-otp?email=<email>`

2. **Verify Email**
   - Check email for OTP code
   - Enter 6-digit code
   - Should auto-login and redirect to `/`

3. **Resend OTP**
   - Click "إعادة إرسال الرمز"
   - Should receive new code
   - 60-second cooldown applies

4. **Login Unverified User**
   - Try to login with unverified account
   - Should redirect to OTP verification

5. **Login Verified User**
   - Normal login flow
   - Should work as before

## Migration

Run the database migration:

```bash
cd backend
alembic upgrade head
```

The migration creates the `email_verification_otps` table.

## Backward Compatibility

✅ **Existing auth system is NOT broken**

- Existing users can still login normally
- Login endpoint unchanged for verified users
- Token handling remains the same
- Refresh token flow unchanged

## Best Practices Implemented

1. ✅ Secure OTP generation (cryptographically secure random)
2. ✅ Rate limiting on all endpoints
3. ✅ Attempt limiting (max 5 tries)
4. ✅ Time-based expiration
5. ✅ Email privacy (doesn't reveal if email exists)
6. ✅ Cooldown period for resend
7. ✅ Automatic login after verification
8. ✅ Clean separation of concerns
9. ✅ Proper error handling
10. ✅ Development mode for email testing

## Future Enhancements

Potential improvements:

1. SMS OTP verification
2. Two-factor authentication (2FA)
3. Remember device option
4. OTP code length configuration
5. Custom email templates
6. Email queue for high volume
7. Analytics on verification rates
