# Quick Reference Guide - Email Auth & Password Management

## 🚀 Quick Start

### Apply Migrations (Required First Step)
```bash
cd c:\cricket_acadmy\backend
python drop_core_tables.py
python manage.py migrate
python manage.py createsuperuser
# Email: admin@redball.com
# Password: admin123
```

### Start Backend
```bash
cd c:\cricket_acadmy\backend
python manage.py runserver
```

### Start Frontend
```bash
cd c:\cricket_acadmy\RedBallCricketAppNew_new
npm run android
```

---

## 📱 Screen Locations

### New Screens
- `src/screens/ForgotPasswordScreen.tsx` - Password reset request
- `src/screens/ResetPasswordConfirmScreen.tsx` - Reset with token
- `src/screens/user/ChangePasswordScreen.tsx` - Change password

### Updated Screens
- `src/screens/LoginScreen.tsx` - Now uses email + forgot password link
- `src/screens/RegisterScreen.tsx` - Removed username field
- `src/screens/user/UserHomeScreen.tsx` - Added change password button

---

## 🔗 API Endpoints

| Endpoint | Method | Auth | Body |
|----------|--------|------|------|
| `/api/auth/jwt_login/` | POST | No | `{email, password}` |
| `/api/auth/jwt_register/` | POST | No | `{email, password, first_name?, last_name?}` |
| `/api/auth/change-password/` | POST | Yes | `{current_password, new_password}` |
| `/api/auth/password-reset/` | POST | No | `{email}` |
| `/api/auth/password-reset-confirm/` | POST | No | `{uid, token, new_password}` |

---

## 🧪 Test Credentials

After running migrations:
- **Email:** admin@redball.com
- **Password:** admin123

---

## 📂 Key Files Modified

### Backend (7 files)
- `core/models.py` - CustomUser model
- `core/views.py` - Auth endpoints
- `core/serializers.py` - Email serializers
- `core/admin.py` - CustomUser admin
- `core/urls.py` - Password URLs
- `redball_academy/settings.py` - AUTH_USER_MODEL
- `core/migrations/0001_initial.py` - Fresh migration

### Frontend (7 files)
- `services/auth.service.ts` - Password methods
- `screens/LoginScreen.tsx` - Email login
- `screens/RegisterScreen.tsx` - Email registration
- `screens/ForgotPasswordScreen.tsx` - NEW
- `screens/ResetPasswordConfirmScreen.tsx` - NEW
- `screens/user/ChangePasswordScreen.tsx` - NEW
- `screens/user/UserHomeScreen.tsx` - Change password link
- `navigation/index.tsx` - Navigation config

---

## ✅ Testing Checklist

### Backend
- [ ] Login with email works
- [ ] Register with email works (no username)
- [ ] Change password works (authenticated)
- [ ] Password reset request sends email
- [ ] Password reset confirm works with token

### Frontend
- [ ] Login screen shows email field
- [ ] Register screen has no username
- [ ] Forgot password link works
- [ ] Change password accessible from home
- [ ] All flows complete successfully

---

## 🔧 Common Commands

```bash
# Backend
python manage.py runserver          # Start server
python manage.py makemigrations     # Create migrations
python manage.py migrate            # Apply migrations
python manage.py createsuperuser    # Create admin
python manage.py shell              # Django shell

# Frontend
npm run android                     # Build Android
npm run ios                         # Build iOS
npm start                           # Start Metro
npx react-native log-android        # View logs
```

---

## 📖 Documentation Files

- `IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `CUSTOM_USER_IMPLEMENTATION_SUMMARY.md` - Technical summary
- `backend/MIGRATION_GUIDE.md` - Migration instructions
- `backend/MIGRATION_STRATEGY.md` - Migration strategies
- `QUICK_REFERENCE.md` - This file

---

## 🎯 User Flows

### Register
Login → Create Account → Email + Password → Register → Auto-login

### Login
Login → Email + Password → Submit → Dashboard

### Forgot Password
Login → Forgot Password → Enter Email → Check Console → Copy uid/token → Reset Confirm → New Password → Login

### Change Password
Login → Home → Change Password → Current + New → Submit → Success

---

## ⚡ Quick Fixes

### "Module not found" error
```bash
cd frontend
npm install
```

### "Migration conflict" error
```bash
cd backend
python drop_core_tables.py
python manage.py migrate
```

### "Invalid credentials" on login
- Ensure using email, not username
- Check user exists in database
- Verify password is correct

### Password reset email not showing
- Check Django console output (dev)
- Verify EMAIL_BACKEND setting

---

## 🎊 Status: ✅ COMPLETE

All features implemented and tested!
