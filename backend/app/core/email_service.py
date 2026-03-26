"""
Email service for sending OTP and other emails.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails."""

    def __init__(
        self,
        smtp_host: Optional[str] = None,
        smtp_port: int = 587,
        smtp_username: Optional[str] = None,
        smtp_password: Optional[str] = None,
        email_from: str = None,
        email_from_name: str = None,
    ):
        self.smtp_host = smtp_host or settings.SMTP_HOST
        self.smtp_port = smtp_port or settings.SMTP_PORT
        self.smtp_username = smtp_username or settings.SMTP_USERNAME
        self.smtp_password = smtp_password or settings.SMTP_PASSWORD
        self.email_from = email_from or settings.EMAIL_FROM
        self.email_from_name = email_from_name or settings.EMAIL_FROM_NAME
        
        # Log configuration on init (only in DEBUG mode)
        if settings.DEBUG:
            logger.debug(f"EmailService initialized:")
            logger.debug(f"  SMTP Host: {self.smtp_host}")
            logger.debug(f"  SMTP Port: {self.smtp_port}")
            logger.debug(f"  SMTP Username: {self.smtp_username}")
            logger.debug(f"  Email From: {self.email_from}")
            if not self.smtp_host:
                logger.warning("SMTP_HOST not configured - emails will be logged only (DEV mode)")

    def _create_message(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> MIMEMultipart:
        """Create email message."""
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{self.email_from_name} <{self.email_from}>"
        msg["To"] = to_email

        # Add text version (fallback)
        if text_content:
            part = MIMEText(text_content, "plain", "utf-8")
            msg.attach(part)

        # Add HTML version
        html_part = MIMEText(html_content, "html", "utf-8")
        msg.attach(html_part)

        return msg

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """
        Send an email.

        Returns True if email was sent successfully, False otherwise.
        In development mode (no SMTP configured), logs the email content.
        """
        logger.info(f"Attempting to send email to: {to_email}")
        logger.info(f"Subject: {subject}")
        
        # If SMTP is not configured, log the email (development mode)
        if not self.smtp_host:
            logger.info(f"[DEV MODE] Email would be sent to: {to_email}")
            logger.info(f"[DEV MODE] Subject: {subject}")
            logger.info(f"[DEV MODE] Content:\n{html_content}")
            return True

        try:
            logger.debug(f"Creating SMTP connection to {self.smtp_host}:{self.smtp_port}")
            msg = self._create_message(to_email, subject, html_content, text_content)

            logger.debug("Opening SMTP connection...")
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.set_debuglevel(1)  # Enable debug output
                logger.debug("Starting TLS...")
                server.starttls()
                if self.smtp_username and self.smtp_password:
                    logger.debug(f"Logging in as {self.smtp_username}")
                    server.login(self.smtp_username, self.smtp_password)
                logger.debug(f"Sending message to {to_email}")
                server.send_message(msg)
                logger.info(f"Email sent successfully to: {to_email}")

            return True

        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP Authentication failed for {to_email}: {str(e)}")
            logger.error("Check SMTP username and password in .env file")
            return False
            
        except smtplib.SMTPConnectError as e:
            logger.error(f"Failed to connect to SMTP server: {str(e)}")
            return False
            
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error occurred: {str(e)}")
            return False
            
        except Exception as e:
            logger.error(f"Unexpected error sending email to {to_email}: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return False

    def send_otp_email(
        self,
        to_email: str,
        otp_code: str,
        user_name: str,
        expire_minutes: int = 10,
    ) -> bool:
        """
        Send OTP verification email.

        Args:
            to_email: Recipient email address
            otp_code: 6-digit OTP code
            user_name: User's name
            expire_minutes: OTP expiration time in minutes
        """
        logger.info(f"Sending OTP email to {to_email} for user {user_name}")
        
        subject = "تحقق من بريدك الإلكتروني - لقطة"

        html_content = f"""
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #16a34a;
                }}
                .otp-code {{
                    background-color: #f0fdf4;
                    border: 2px dashed #16a34a;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 20px 0;
                }}
                .otp-number {{
                    font-size: 36px;
                    font-weight: bold;
                    color: #16a34a;
                    letter-spacing: 8px;
                    font-family: monospace;
                }}
                .info {{
                    color: #666;
                    font-size: 14px;
                    line-height: 1.6;
                }}
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🛒 لقطة</div>
                </div>

                <h2>مرحباً {user_name}،</h2>

                <p class="info">
                    شكرًا لانضمامك إلى لقطة! يرجى استخدام رمز التحقق التالي لتأكيد بريدك الإلكتروني:
                </p>

                <div class="otp-code">
                    <div class="otp-number">{otp_code}</div>
                </div>

                <p class="info">
                    <strong>معلومات مهمة:</strong>
                    <br>
                    • هذا الرمز صالح لمدة {expire_minutes} دقائق
                    <br>
                    • لا تشارك هذا الرمز مع أي شخص
                    <br>
                    • إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد
                </p>

                <p class="info">
                    بعد التحقق، سيتم تسجيل دخولك تلقائيًا إلى حسابك.
                </p>

                <div class="footer">
                    <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.</p>
                    <p>&copy; {2026} لقطة. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        مرحباً {user_name}،

        شكرًا لانضمامك إلى لقطة!

        رمز التحقق الخاص بك هو: {otp_code}

        هذا الرمز صالح لمدة {expire_minutes} دقائق.

        بعد التحقق، سيتم تسجيل دخولك تلقائيًا إلى حسابك.

        إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد.

        © {2026} لقطة. جميع الحقوق محفوظة.
        """

        return self.send_email(to_email, subject, html_content, text_content)


# Singleton instance
email_service = EmailService()
