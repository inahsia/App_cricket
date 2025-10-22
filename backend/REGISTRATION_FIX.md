# Registration Fix Summary

## Issue
`POST /api/auth/jwt_register/` was returning 400 Bad Request

## Root Cause
The registration view was trying to access `user.profile` which might not exist immediately after user creation, even with the signal in place. The signal's `else` clause was also trying to save a profile that might not exist yet.

## Fixes Applied

### 1. Updated Signal Handler (`core/models.py`)
```python
@receiver(post_save, sender=CustomUser)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # Only save profile if it exists
        if hasattr(instance, 'profile'):
            instance.profile.save()
```

### 2. Updated Registration View (`core/views.py`)
```python
@api_view(['POST'])
@permission_classes([AllowAny])
def jwt_register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user_type = request.data.get('user_type', 'customer')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Ensure profile is created (signal should handle this, but double-check)
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.user_type = user_type
        profile.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'User registered successfully',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'user_type': user_type,
            'is_staff': user.is_staff
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
```

## Changes Made
1. **Signal now checks** if profile exists before trying to save it in the else block
2. **Registration view now uses** `get_or_create()` to ensure profile exists
3. **Added try-except** to catch and return meaningful errors
4. **Profile user_type is explicitly set** and saved after creation

## Testing

### Test Registration via API:
```bash
curl -X POST http://localhost:8000/api/auth/jwt_register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User",
    "user_type": "customer"
  }'
```

### Expected Response:
```json
{
  "message": "User registered successfully",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
  },
  "user_type": "customer",
  "is_staff": false
}
```

## Next Steps
1. Restart Django server: `python manage.py runserver`
2. Test registration from frontend
3. Verify profile is created in admin panel
4. Test complete flow: Register → Login → Access protected endpoints
