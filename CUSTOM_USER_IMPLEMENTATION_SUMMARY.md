# Custom User Model & Password Management - Implementation Summary

## ✅ Completed Tasks

### 1. Backend - Custom User Model
- ✅ Created `CustomUser` model in `core/models.py` with:
  - Email as USERNAME_FIELD (no username field)
  - Custom manager (CustomUserManager)
  - Inherits from AbstractUser for compatibility
- ✅ Updated `settings.py`: `AUTH_USER_MODEL = 'core.CustomUser'`
- ✅ Updated all models to use CustomUser:
  - UserProfile, Booking, Player all reference CustomUser
  - Updated __str__ methods to use email instead of username
- ✅ Updated `core/serializers.py`:
  - UserSerializer fields changed from username to email
  - All serializers use `get_user_model()`
- ✅ Updated `core/views.py`:
  - jwt_login accepts email (authenticates with email)
  - jwt_register requires only email (no username)
  - Player creation uses email only
  - All views use `get_user_model()`
- ✅ Updated `core/admin.py`:
  - Registered CustomUser with CustomUserAdmin
  - Updated search/list fields to use email

### 2. Backend - Password Management Endpoints
- ✅ `/api/auth/change-password/` - POST (authenticated)
  - Accepts: `{current_password, new_password}`
  - Validates current password
  - Returns: `{message: "Password changed successfully"}`
- ✅ `/api/auth/password-reset/` - POST (public)
  - Accepts: `{email}`
  - Generates token and sends reset link via email
  - Returns: Generic success message (doesn't leak emails)
- ✅ `/api/auth/password-reset-confirm/` - POST (public)
  - Accepts: `{uid, token, new_password}`
  - Validates token and resets password
  - Returns: `{message: "Password has been reset successfully"}`

### 3. Backend - Email Configuration
- ✅ EMAIL_BACKEND set to console for development
- ✅ DEFAULT_FROM_EMAIL configured
- ✅ Password reset uses Django's default token generator

### 4. Frontend - Auth Service Updates
- ✅ Updated `LoginData` interface to use email
- ✅ Updated `RegisterData` interface (removed username)
- ✅ Added `changePassword()` method
- ✅ Added `requestPasswordReset()` method
- ✅ Added `confirmPasswordReset()` method
- ✅ login() now sends email field instead of username

### 5. Frontend - LoginScreen Updates
- ✅ Changed from "Username" field to "Email" field
- ✅ Added email validation
- ✅ Added "Forgot Password?" button
- ✅ Updated to use email in login request

### 6. Frontend - New Screens Created
- ✅ ForgotPasswordScreen.tsx
  - Email input
  - Sends reset request
  - Shows success message
  - Back to login button

## 📋 Remaining Tasks

### 1. Database Migration (REQUIRED)
The backend code is ready but the database needs to be migrated. Choose one approach:

#### Option A: Fresh Database (Recommended for Dev)
```bash
cd c:\cricket_acadmy\backend

# Run the drop_core_tables.py script to clean tables
python drop_core_tables.py

# OR manually drop and recreate database (if psql is available)
# psql -U postgres -c "DROP DATABASE redball_cricket_db;"
# psql -U postgres -c "CREATE DATABASE redball_cricket_db;"

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Email: admin@redball.com
# Password: (your choice)
```

#### Option B: Data Migration (Production - Preserves Data)
Follow the detailed steps in `backend/MIGRATION_STRATEGY.md`

### 2. Frontend - Additional Screens Needed

#### ChangePasswordScreen.tsx
```typescript
// Location: src/screens/user/ChangePasswordScreen.tsx
// Fields: current_password, new_password, confirm_new_password
// Calls: AuthService.changePassword()
// Requires: User must be authenticated
```

#### ResetPasswordConfirmScreen.tsx
```typescript
// Location: src/screens/ResetPasswordConfirmScreen.tsx
// For users who clicked email link
// Fields: new_password, confirm_new_password
// Parse uid & token from deep link or manual entry
// Calls: AuthService.confirmPasswordReset()
```

### 3. Frontend - RegisterScreen Updates
Update `src/screens/RegisterScreen.tsx`:
- Remove username field
- Keep only: email, password, first_name, last_name
- Update validation to check email

### 4. Frontend - Navigation Updates
Add new screens to navigation stack:
```typescript
// In src/navigation/index.tsx
<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
<Stack.Screen name="ResetPasswordConfirm" component={ResetPasswordConfirmScreen} />

// In user tab navigator
<Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
```

### 5. Production Email Configuration
Update `backend/redball_academy/settings.py` for production:
```python
# Use environment variables
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='no-reply@redball.com')
```

### 6. Frontend - Deep Linking (Optional)
To handle password reset links clicked from email:
```typescript
// Configure deep linking to parse: 
// https://yourapp.com/reset-password/?uid=xxx&token=yyy
// And navigate to ResetPasswordConfirmScreen with params
```

## 📁 Files Modified

### Backend
- `core/models.py` - Added CustomUser model
- `core/views.py` - Updated auth endpoints, added password endpoints
- `core/serializers.py` - Added password serializers, updated user serializer
- `core/urls.py` - Added password endpoint URLs
- `core/admin.py` - Registered CustomUser admin
- `redball_academy/settings.py` - Set AUTH_USER_MODEL, email backend

### Frontend
- `src/services/auth.service.ts` - Updated for email, added password methods
- `src/screens/LoginScreen.tsx` - Changed to email input
- `src/screens/ForgotPasswordScreen.tsx` - New file

### Documentation
- `backend/MIGRATION_GUIDE.md` - Comprehensive migration guide
- `backend/MIGRATION_STRATEGY.md` - Migration options and strategies
- `backend/migrate_to_customuser.py` - Pre-migration check script
- `backend/drop_core_tables.py` - Helper script to clean database

## 🧪 Testing Checklist

### Backend API Tests
```bash
# Test login with email
curl -X POST http://localhost:8000/api/auth/jwt_login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@redball.com", "password": "admin123"}'

# Test registration with email
curl -X POST http://localhost:8000/api/auth/jwt_register/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123", "first_name": "Test", "last_name": "User"}'

# Test password reset request
curl -X POST http://localhost:8000/api/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@redball.com"}'
# Check console for reset link

# Test change password (requires auth token)
curl -X POST http://localhost:8000/api/auth/change-password/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"current_password": "old123", "new_password": "new123"}'
```

### Frontend Tests
- [ ] Login with email works
- [ ] Registration with email works
- [ ] Forgot password sends email
- [ ] Change password updates password
- [ ] Reset password with token works
- [ ] All user data displays correctly

## 🚀 Deployment Steps

1. **Backup Production Database**
   ```bash
   pg_dump -U postgres redball_cricket_db > backup_$(date +%Y%m%d).sql
   ```

2. **Deploy Backend Code**
   - Push updated models, views, serializers
   - Set EMAIL configuration in production env vars

3. **Run Migrations**
   ```bash
   python manage.py migrate
   ```

4. **Update Admin Users**
   - Existing admins will need to login with their email

5. **Deploy Frontend**
   - Build and deploy updated React Native app
   - Users will see email field instead of username

6. **Monitor**
   - Watch server logs for auth errors
   - Monitor email sending
   - Check user feedback

## 📚 API Documentation

### Authentication Endpoints
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/jwt_login/` | POST | No | Login with email & password |
| `/api/auth/jwt_register/` | POST | No | Register with email |
| `/api/auth/change-password/` | POST | Yes | Change password |
| `/api/auth/password-reset/` | POST | No | Request reset link |
| `/api/auth/password-reset-confirm/` | POST | No | Confirm reset with token |

### Request/Response Examples

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "user_type": "customer",
  "is_staff": false
}
```

**Change Password Request:**
```json
{
  "current_password": "old_password",
  "new_password": "new_password123"
}
```

**Password Reset Request:**
```json
{
  "email": "user@example.com"
}
```

**Password Reset Confirm:**
```json
{
  "uid": "MQ",
  "token": "ab1-234abc...",
  "new_password": "new_password123"
}
```

## ⚠️ Important Notes

1. **Email Uniqueness**: All users must have unique emails. Run pre-migration checks.
2. **Existing Users**: After migration, users login with email instead of username.
3. **Password Tokens**: Reset tokens expire after 24 hours (Django default).
4. **Email Backend**: Development uses console backend. Configure SMTP for production.
5. **Frontend Deep Links**: Password reset links should deep link to the app.

## 🔗 Related Documentation
- Django Custom User Models: https://docs.djangoproject.com/en/4.2/topics/auth/customizing/#substituting-a-custom-user-model
- Django Password Reset: https://docs.djangoproject.com/en/4.2/topics/auth/default/#django.contrib.auth.views.PasswordResetView
- React Native Deep Linking: https://reactnavigation.org/docs/deep-linking/
