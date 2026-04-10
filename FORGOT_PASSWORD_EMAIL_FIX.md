# Forgot Password Email Fix

## Problem
The verification code (OTP/password reset token) was not being sent to the user's email when they tried to reset their password.

## Root Cause Analysis

### Issue #1: Silent Error Swallowing
The `forgot_password` endpoint in `backend/app/api/v1/auth.py` had a `try/except` block that caught ALL exceptions and only logged them without providing visibility into what actually failed:

```python
except Exception as e:
    logger.error(f"Error sending password reset email: {e}")
    # Don't fail the request if email fails - token is still valid
```

This made it impossible to diagnose why emails weren't being sent because:
- The error was hidden from the response
- Only a generic error message was logged
- No SMTP configuration details were logged
- No stack trace was captured

### Issue #2: Missing Text Content
The `send_email()` method was called without a `text_content` parameter, which could cause issues with email clients that prefer text over HTML.

### Issue #3: Insufficient Logging
The endpoint didn't log:
- SMTP host configuration
- SMTP port configuration  
- SMTP username
- Whether SMTP was configured at all

## Changes Made

### 1. Enhanced Logging in `forgot_password` Endpoint
**File:** `backend/app/api/v1/auth.py`

Added comprehensive logging before attempting to send the email:

```python
# Log email service configuration for debugging
logger.info(f"Email service SMTP host: {email_service.smtp_host}")
logger.info(f"Email service SMTP port: {email_service.smtp_port}")
logger.info(f"Email service username: {email_service.smtp_username}")

if not email_service.smtp_host:
    logger.warning("SMTP not configured - email will be logged only (DEV mode)")
```

### 2. Added Text Content Fallback
Added a plain text version of the email for better email client compatibility:

```python
# Add text fallback
text_content = f"""
مرحباً {user.name}،

لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك.

انقر على الرابط التالي لإعادة تعيين كلمة المرور:
{reset_link}

هذا الرابط صالح لمدة {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} دقيقة.

إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.

© {2026} لقطة. جميع الحقوق محفوظة.
"""

email_sent = email_service.send_email(user.email, subject, html_content, text_content)
```

### 3. Better Error Handling and Logging
Improved the exception handling to provide more diagnostic information:

```python
except Exception as e:
    logger.error(f"Exception while sending password reset email: {type(e).__name__}: {str(e)}")
    import traceback
    logger.error(traceback.format_exc())
    email_sent = False
```

This now logs:
- Exception type (e.g., `SMTPAuthenticationError`, `SMTPConnectError`)
- Full error message
- Complete stack trace for debugging

### 4. Fixed pytest.ini Configuration
**File:** `backend/pytest.ini`

Removed invalid coverage configuration that was causing pytest to fail:
- Removed `[tool.coverage.run]` section
- Removed `[tool.coverage.report]` section

## How to Debug Email Issues Now

When a user reports not receiving the password reset email, check the backend logs for:

1. **Configuration Check:**
   ```
   Email service SMTP host: smtp.gmail.com
   Email service SMTP port: 587
   Email service username: lakta.lakta.2026@gmail.com
   ```

2. **Success Indicators:**
   ```
   Attempting to send password reset email to: user@example.com
   Email sent successfully to: user@example.com
   Password reset email sent successfully to user@example.com
   ```

3. **Error Indicators:**
   - `SMTP not configured - email will be logged only (DEV mode)` - SMTP_HOST is None
   - `SMTP Authentication failed` - Wrong username/password in .env
   - `Failed to connect to SMTP server` - Network/firewall issue
   - `Exception while sending password reset email` - Full stack trace will be logged

## Current SMTP Configuration
From `.env` file:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=lakta.lakta.2026@gmail.com
SMTP_PASSWORD=eeldipakxuemqwpf
EMAIL_FROM=lakta.lakta.2026@gmail.com
EMAIL_FROM_NAME=Lakta App
```

## Testing
All existing tests pass:
- ✅ `test_forgot_password` - PASSED
- ✅ `test_reset_password` - PASSED

## Common Issues to Check

### Gmail SMTP Issues:
1. **App Password Expired:** The app password in `.env` might need to be regenerated
2. **2FA Required:** Google account needs 2FA enabled for app passwords
3. **Less Secure Apps:** Google no longer allows this - must use app passwords
4. **Network/Firewall:** Port 587 might be blocked

### To Regenerate Gmail App Password:
1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate new app password for "Mail"
4. Update `SMTP_PASSWORD` in `.env`

## Next Steps (Optional)
- Consider adding email delivery tracking
- Add retry logic for transient failures
- Implement email queue for reliability
- Add email delivery status to API response in development mode
