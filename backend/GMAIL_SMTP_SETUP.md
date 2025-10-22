# Gmail SMTP Configuration Guide

## Overview
Your Django application is now configured to send real emails via Gmail SMTP.

## Setup Steps

### 1. Enable 2-Factor Authentication on Your Gmail Account
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already enabled

### 2. Generate Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **App**: Mail
3. Select **Device**: Other (Custom name) - enter "Red Ball Cricket Academy"
4. Click **Generate**
5. Gmail will show you a 16-character password (e.g., `abcd efgh ijkl mnop`)
6. **Copy this password** - you'll need it in the next step

### 3. Update .env File
Edit `backend/.env` and replace these values:

```
EMAIL_HOST_USER=your-actual-email@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop  # The 16-character app password (no spaces)
DEFAULT_FROM_EMAIL=your-actual-email@gmail.com
```

**Example:**
```
EMAIL_HOST_USER=redball.academy@gmail.com
EMAIL_HOST_PASSWORD=xmkp qwer tyui asdf  # Remove spaces when pasting
DEFAULT_FROM_EMAIL=redball.academy@gmail.com
```

### 4. Test Email Configuration

Run this test script:
```powershell
cd c:\cricket_acadmy\backend
python -c "from django.core.mail import send_mail; send_mail('Test Email', 'This is a test email from Red Ball Cricket Academy', 'from@example.com', ['test@example.com'], fail_silently=False)"
```

Or create a test script:

```python
# test_email.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redball_academy.settings')
django.setup()

from django.core.mail import send_mail

send_mail(
    'Test Email - Red Ball Cricket Academy',
    'This is a test email. If you receive this, Gmail SMTP is configured correctly!',
    'noreply@redball.com',
    ['your-test-email@gmail.com'],  # Replace with your email to receive test
    fail_silently=False,
)
print("✓ Test email sent successfully!")
```

### 5. Current Email Configuration

Your settings are now:
- **Backend**: SMTP (Gmail)
- **Host**: smtp.gmail.com
- **Port**: 587
- **TLS**: Enabled
- **From Email**: Set in .env

## Password Reset Flow

### Backend Endpoints:
1. **Request Password Reset**: `POST /api/auth/password-reset/`
   - Body: `{ "email": "user@example.com" }`
   - Sends email with reset link

2. **Confirm Password Reset**: `POST /api/auth/password-reset-confirm/`
   - Body: `{ "uid": "...", "token": "...", "new_password": "..." }`
   - Sets new password

### Frontend Screens:
- **ForgotPasswordScreen**: User enters email
- **ResetPasswordConfirmScreen**: User enters new password with uid/token from email link

## Email Template

The password reset email will contain:
- Subject: "Password Reset Request"
- Reset link format: `http://localhost:8000/reset/{uid}/{token}/`
- Link expires after 1 day (default Django setting)

## Troubleshooting

### Common Issues:

**1. SMTPAuthenticationError: Username and Password not accepted**
- Solution: Generate a new App Password (see Step 2)
- Make sure 2FA is enabled on your Gmail account

**2. SMTPException: STARTTLS extension not supported**
- Solution: Check EMAIL_PORT is 587 and EMAIL_USE_TLS is True

**3. No email received**
- Check spam/junk folder
- Verify EMAIL_HOST_USER and DEFAULT_FROM_EMAIL match
- Test with the test script above

**4. Development vs Production**
- For development: You can switch back to console backend by setting:
  ```
  EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
  ```
- For production: Use Gmail SMTP or dedicated email services (SendGrid, Mailgun, AWS SES)

## Alternative Email Backends

### Console Backend (Development)
Prints emails to console instead of sending:
```
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### File Backend (Testing)
Saves emails to files:
```
EMAIL_BACKEND=django.core.mail.backends.filebased.EmailBackend
EMAIL_FILE_PATH=/path/to/email/files
```

### Production Services
For production, consider:
- **SendGrid**: Better deliverability, email analytics
- **Mailgun**: Transactional emails, API-first
- **AWS SES**: Cost-effective for high volume

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate App Passwords regularly
- Use dedicated email account for application (not personal)

## Next Steps

1. Update `.env` with your Gmail credentials
2. Run test email script
3. Test password reset flow from frontend
4. Check email delivery
5. Monitor Gmail sending limits (500 emails/day for free Gmail)

## Gmail Sending Limits

- **Free Gmail**: 500 emails per day
- **Google Workspace**: 2000 emails per day

For higher volume, consider dedicated email services.
