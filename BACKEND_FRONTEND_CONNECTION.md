# Backend-Frontend Connection Guide

## ✅ Connection Status: WORKING

The React Native frontend and Django backend are **successfully connected**.

## Connection Details

### Frontend Configuration
- **API Base URL**: `http://10.0.2.2:8000/api`
- **Location**: `src/config/api.ts`
- **Why 10.0.2.2?**: This is the special IP address that Android emulators use to access the host machine's localhost

### Backend Configuration
- **Server**: Django Development Server
- **Port**: 8000
- **API Root**: `/api`
- **Authentication**: Token-based (Django REST Framework Token Authentication)

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration (returns token + user)
- `POST /api/auth/login/` - User login (returns token + user)

### Sports
- `GET /api/sports/` - List all active sports
- `GET /api/sports/{id}/available_slots/` - Get available slots for a sport

### Slots
- `GET /api/slots/` - List all slots
- `GET /api/slots/available/` - List only available slots

### Bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/my_bookings/` - Get current user's bookings
- `POST /api/bookings/{id}/cancel/` - Cancel booking

### Players
- `GET /api/players/my_profile/` - Get player profile
- `GET /api/players/qr_code/` - Get QR code for player

### Admin
- `GET /api/dashboard-stats/` - Dashboard statistics (Admin only)
- `POST /api/scan-qr/` - Scan QR code (Admin only)

## Recent Fixes Applied

### 1. Registration Auto-Login Issue (FIXED ✅)
**Problem**: Backend register endpoint was not returning an authentication token, causing frontend registration to fail.

**Solution**: Updated `backend/core/views.py` register function to:
- Import `Token` model from `rest_framework.authtoken.models`
- Create/get token after user registration
- Return token in response along with user data
- Include `is_staff` field for role determination

**Before**:
```python
return Response({
    'message': 'User registered successfully',
    'user': UserSerializer(user).data
}, status=status.HTTP_201_CREATED)
```

**After**:
```python
token, created = Token.objects.get_or_create(user=user)
return Response({
    'message': 'User registered successfully',
    'token': token.key,
    'user': UserSerializer(user).data,
    'is_staff': user.is_staff
}, status=status.HTTP_201_CREATED)
```

### 2. Token Import Cleanup
- Moved `Token` import to top-level imports for cleaner code
- Removed duplicate inline imports from login and register functions

## How It Works

### 1. User Registration Flow
```
User fills form → RegisterScreen validates data → AuthService.register() 
→ POST /api/auth/register/ → Backend creates user + token 
→ Frontend saves token to AsyncStorage → Auto-login successful 
→ Navigate to UserHomeScreen
```

### 2. User Login Flow
```
User enters credentials → LoginScreen validates → AuthService.login()
→ POST /api/auth/login/ → Backend validates credentials + returns token
→ Frontend saves token → Navigate based on user role (user/player/admin)
```

### 3. API Request Flow
```
User action → Service function (e.g., SportsService.getAll())
→ ApiService adds auth token to headers
→ Django backend verifies token
→ Returns data if authenticated
→ Frontend displays data
```

## Testing the Connection

### 1. Check Backend is Running
```bash
cd C:\cricket_acadmy\backend
python manage.py runserver
```
Should see: `Starting development server at http://127.0.0.1:8000/`

### 2. Test Registration from App
1. Open app on Android emulator
2. Click "Create Account"
3. Fill in all required fields
4. Click "Register"
5. Should navigate to UserHomeScreen automatically

### 3. Test Login from App
1. Open app on Android emulator
2. Enter username and password
3. Click "Login"
4. Should navigate based on user role

### 4. Monitor Backend Logs
Watch the terminal running Django server to see API requests:
```
"POST /api/auth/register/ HTTP/1.1" 201 [size]  ✅ Success
"POST /api/auth/login/ HTTP/1.1" 200 [size]     ✅ Success
"GET /api/sports/ HTTP/1.1" 200 [size]          ✅ Success
"POST /api/auth/register/ HTTP/1.1" 400 [size]  ❌ Validation error
```

## Common Issues & Solutions

### Issue: "Network Error" or "Unable to connect"
**Solution**: 
- Ensure backend is running on port 8000
- Check that you're using `10.0.2.2` (not `localhost`) for Android emulator
- Verify firewall isn't blocking port 8000

### Issue: "401 Unauthorized" errors
**Solution**:
- Token may have expired or is invalid
- Log out and log back in to get a new token
- Check that token is being saved to AsyncStorage

### Issue: "400 Bad Request" on registration
**Solution**:
- Username or email may already exist
- Check that all required fields are filled
- Look at backend terminal for specific error message

### Issue: CORS errors (if using web version)
**Solution**:
- Add `django-cors-headers` to Django settings
- Configure CORS to allow frontend domain

## Environment-Specific URLs

### Android Emulator
```typescript
export const BASE_URL = 'http://10.0.2.2:8000/api';
```

### iOS Simulator
```typescript
export const BASE_URL = 'http://localhost:8000/api';
```

### Physical Device (same WiFi network)
```typescript
export const BASE_URL = 'http://192.168.x.x:8000/api'; // Your computer's local IP
```

### Production
```typescript
export const BASE_URL = 'https://your-domain.com/api';
```

## Next Steps

1. ✅ Backend-Frontend connection established
2. ✅ Registration and login working
3. ⏳ Test other API endpoints (sports, slots, bookings)
4. ⏳ Implement remaining screens
5. ⏳ Add error handling for network failures
6. ⏳ Add loading states and better UX

## Notes

- All API requests automatically include the auth token in headers
- Token is stored securely in AsyncStorage
- Backend uses Django REST Framework Token Authentication
- Player accounts are auto-created when added to bookings
- Admin users have `is_staff=True` in the database
