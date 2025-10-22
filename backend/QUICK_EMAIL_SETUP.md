# Quick Start: Gmail SMTP Setup

## 🚀 Fast Setup (3 Steps)

### Step 1: Get Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Generate password for "Red Ball Cricket Academy"
3. Copy the 16-character password (remove spaces)

### Step 2: Update .env File
Edit `backend/.env`:
```bash
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password-no-spaces
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

### Step 3: Test It
```powershell
cd c:\cricket_acadmy\backend
python test_email.py
```

## 📧 That's It!

Your password reset emails will now be sent via Gmail.

## 🔍 Verify It's Working

### Test from Django Admin:
1. Start server: `python manage.py runserver`
2. Access: http://localhost:8000/admin/
3. Try "Forgot password?" link

### Test from API:
```bash
curl -X POST http://localhost:8000/api/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Test from Frontend:
1. Open your React Native app
2. Go to Login Screen
3. Tap "Forgot Password?"
4. Enter email and submit
5. Check email inbox

## 📝 Important Notes

✅ **DO:**
- Use Gmail App Password (not your regular password)
- Enable 2-Factor Authentication first
- Check spam folder if you don't see email
- Use a dedicated email account (not personal)

❌ **DON'T:**
- Commit `.env` file to git (already in .gitignore)
- Share your App Password
- Use personal Gmail for production

## 🆘 Troubleshooting

**Can't generate App Password?**
→ Enable 2-Factor Authentication first

**Email not received?**
→ Check spam folder, verify EMAIL_HOST_USER matches DEFAULT_FROM_EMAIL

**Authentication failed?**
→ Double-check App Password in .env (no spaces)

**Want to test without real emails?**
→ Set in .env: `EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend`
(Emails will print to console instead)

## 📚 Full Documentation
See `GMAIL_SMTP_SETUP.md` for complete details.
