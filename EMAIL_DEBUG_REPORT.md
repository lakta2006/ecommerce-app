# Email Delivery Debug Report

## Problem Summary
The forgot password and email verification features were not sending emails, even though the API endpoints returned success messages.

## Root Causes Identified

### 1. Backend Endpoint Issue (FIXED)
**File**: `backend/app/api/v1/auth.py`

The `forgot_password` endpoint had the request data parameter incorrectly defined. FastAPI was confused about where to get `request_data` from because of the `request` parameter (used for rate limiting).

**Fix**: Added `= Body(...)` to explicitly tell FastAPI to read the data from the request body:
```python
async def forgot_password(
    request: Request,
    request_data: ForgotPasswordRequest = Body(...),  # <-- Added = Body(...)
    db: Annotated[Session, Depends(get_db)] = None
):
```

### 2. Email Not Being Sent (FIXED)
**File**: `backend/app/api/v1/auth.py`

The `forgot_password` endpoint had a TODO comment indicating email sending was not implemented:
```python
# TODO: Send email with reset token
# For now, return the token (in production, only send via email)
```

**Fix**: Implemented email sending with proper error handling:
- Creates HTML email with reset link
- Calls `email_service.send_email()`
- Logs success/failure
- Doesn't fail the request if email sending fails (token is still valid)

### 3. Insufficient Email Service Logging (FIXED)
**File**: `backend/app/core/email_service.py`

The email service had minimal logging, making it hard to debug issues.

**Fix**: Enhanced logging throughout the email sending process:
- Logs configuration on initialization
- Logs each step of SMTP connection
- Specific error handling for:
  - `SMTPAuthenticationError` - Invalid credentials
  - `SMTPConnectError` - Cannot connect to server
  - `SMTPException` - Other SMTP errors
  - General exceptions with stack trace

## Current Configuration

### SMTP Settings (from `.env`)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=lakta.lakta.2026@gmail.com
SMTP_PASSWORD=eeldipakxuemqwpf  # App-specific password
EMAIL_FROM=lakta.lakta.2026@gmail.com
EMAIL_FROM_NAME=Lakta App
```

### Rate Limiting
- **Forgot Password**: 3 requests per hour per IP
- **Send OTP**: 5 requests per minute per IP
- **Resend OTP**: 3 requests per minute per IP
- **Verify OTP**: 10 requests per minute per IP

## Testing

### Test Forgot Password Endpoint
```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

**Expected Response** (for existing email):
```json
{
  "message": "Password reset token generated",
  "reset_token": "..."
}
```

**Expected Behavior**:
1. Email should be sent to the user
2. Backend logs should show:
   - `Attempting to send email to: user@example.com`
   - `Password reset email sent to user@example.com`
3. User receives email with reset link

### Test Send OTP Endpoint
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

**Expected Response**:
```json
{
  "message": "Verification code sent successfully",
  "expires_in_seconds": 600
}
```

## Troubleshooting

### If Emails Are Not Being Received

1. **Check Backend Logs**
   Look for these log messages:
   - `EmailService initialized:` - Shows SMTP config
   - `Attempting to send email to:` - Email send attempt
   - `Email sent successfully to:` - Success
   - `SMTP Authentication failed:` - Wrong credentials
   - `Failed to connect to SMTP server:` - Network/Server issue

2. **Common Issues**

   **Gmail App Password**
   - Gmail requires an "App Password" for third-party apps
   - Generate one at: https://myaccount.google.com/apppasswords
   - Update `SMTP_PASSWORD` in `.env`

   **Two-Factor Authentication**
   - Gmail account must have 2FA enabled for app passwords
   - Enable at: https://myaccount.google.com/security

   **Less Secure Apps**
   - Gmail no longer supports "Less Secure Apps"
   - Must use App Password instead

   **Firewall/Network**
   - Port 587 must be open for outbound connections
   - Some networks block SMTP ports

3. **Test SMTP Connection Manually**
   ```bash
   cd backend
   python -c "
   from app.core.email_service import email_service
   result = email_service.send_email(
       to_email='your-email@example.com',
       subject='Test',
       html_content='<h1>Test Email</h1>'
   )
   print(f'Email send result: {result}')
   "
   ```

### If Rate Limiting Is Triggered

**Error Response**:
```json
{
  "detail": {
    "error": "rate_limit_exceeded",
    "message": "Too many requests. Please try again later.",
    "retry_after": "3600"
  }
}
```

**Solution**: Wait for the specified time or restart the server (for development).

## Files Modified

1. `backend/app/api/v1/auth.py`
   - Fixed `forgot_password` endpoint parameter
   - Added email sending to `forgot_password`
   - Added logger import

2. `backend/app/core/email_service.py`
   - Enhanced logging throughout
   - Added specific error handling
   - Added configuration logging

## Next Steps for Production

1. **Remove reset_token from response**
   The current implementation returns the reset token in the API response for development. In production, remove this line:
   ```python
   return {
       "message": "Password reset token generated",
       "reset_token": reset_token  # REMOVE THIS IN PRODUCTION
   }
   ```

2. **Configure Production SMTP**
   Update `.env` with production SMTP credentials

3. **Use HTTPS**
   Update reset link to use HTTPS:
   ```python
   reset_link = f"https://yourdomain.com/reset-password?token={reset_token}"
   ```

4. **Add Email Queue**
   For better performance, consider adding a task queue (e.g., Celery) for sending emails asynchronously.

5. **Email Templates**
   Move email templates to separate files for easier maintenance.

## Monitoring

To monitor email delivery:

1. **Enable DEBUG Logging**
   Set `DEBUG=True` in `.env` to see detailed logs

2. **Check Logs Regularly**
   Look for patterns in failed sends

3. **Track Email Opens** (Future)
   Consider adding email tracking pixels to monitor delivery rates
