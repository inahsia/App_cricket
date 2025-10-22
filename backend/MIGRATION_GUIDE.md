# Custom User Model Migration Guide

## Overview
This guide will help you migrate from Django's default `User` model to a custom `CustomUser` model that uses **email as the primary authentication field** instead of username.

## ⚠️ IMPORTANT: Backup Your Data First!
```bash
# Backup your database
pg_dump -U postgres redball_cricket_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Or export users data as JSON
python manage.py dumpdata auth.User core.UserProfile core.Booking core.Player --indent 2 > users_backup.json
```

## Migration Steps

### Step 1: Prepare the Environment
Ensure you're in a development environment and your virtual environment is activated:
```bash
cd c:\cricket_acadmy\backend
# If using venv
.\venv\Scripts\activate
```

### Step 2: Update settings.py
The custom user model is already configured. Verify this line in `redball_academy/settings.py`:
```python
AUTH_USER_MODEL = 'core.CustomUser'
```

### Step 3: Create Initial Migration
```bash
python manage.py makemigrations core
```

### Step 4: Review the Migration
Check the generated migration file in `core/migrations/`. It should create the CustomUser model.

### Step 5: Create Data Migration
We need to migrate existing User data to CustomUser. Run:
```bash
python manage.py makemigrations core --empty --name migrate_user_data
```

Then edit the generated migration file (see example below).

### Step 6: Apply Migrations
```bash
python manage.py migrate
```

## Data Migration Script Template

Create a file `core/migrations/000X_migrate_user_data.py` (replace X with next number):

```python
from django.db import migrations
from django.contrib.auth.hashers import make_password


def migrate_users_forward(apps, schema_editor):
    """Migrate data from old User to CustomUser"""
    OldUser = apps.get_model('auth', 'User')
    CustomUser = apps.get_model('core', 'CustomUser')
    UserProfile = apps.get_model('core', 'UserProfile')
    Booking = apps.get_model('core', 'Booking')
    Player = apps.get_model('core', 'Player')
    
    # Copy all users
    user_mapping = {}
    for old_user in OldUser.objects.all():
        # Use email if available, otherwise create from username
        email = old_user.email if old_user.email else f"{old_user.username}@placeholder.local"
        
        new_user = CustomUser.objects.create(
            id=old_user.id,
            password=old_user.password,
            email=email,
            first_name=old_user.first_name,
            last_name=old_user.last_name,
            is_staff=old_user.is_staff,
            is_active=old_user.is_active,
            is_superuser=old_user.is_superuser,
            date_joined=old_user.date_joined,
            last_login=old_user.last_login,
        )
        user_mapping[old_user.id] = new_user
    
    print(f"Migrated {len(user_mapping)} users to CustomUser")


def migrate_users_backward(apps, schema_editor):
    """Reverse migration"""
    CustomUser = apps.get_model('core', 'CustomUser')
    CustomUser.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ('core', '000X_previous_migration'),  # Update with actual previous migration
    ]
    
    operations = [
        migrations.RunPython(migrate_users_forward, migrate_users_backward),
    ]
```

## Post-Migration Tasks

### 1. Update JWT Authentication
The auth endpoints already support email-based login. Test them:

```bash
# Login with email
curl -X POST http://localhost:8000/api/auth/jwt_login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### 2. Create Superuser with Email
```bash
python manage.py createsuperuser
# It will ask for email instead of username
```

### 3. Test All Endpoints
```bash
python manage.py test core
```

### 4. Update Frontend
Update the frontend login/register forms to use `email` field instead of `username`.

## Rollback Plan

If something goes wrong:

### Option 1: Restore from Backup
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE redball_cricket_db;"
psql -U postgres -c "CREATE DATABASE redball_cricket_db;"

# Restore backup
psql -U postgres redball_cricket_db < backup_YYYYMMDD_HHMMSS.sql
```

### Option 2: Reverse Migrations
```bash
# Rollback to before custom user migration
python manage.py migrate core 000X  # Replace X with migration before CustomUser

# Remove AUTH_USER_MODEL from settings.py
# Comment out: AUTH_USER_MODEL = 'core.CustomUser'
```

## Testing Checklist

- [ ] All existing users can login with their email
- [ ] New user registration works with email
- [ ] Password reset flow works with email
- [ ] Admin panel authentication works
- [ ] Bookings are correctly associated with users
- [ ] Player profiles are correctly linked
- [ ] JWT tokens are generated correctly
- [ ] Frontend login/register screens work

## Common Issues and Solutions

### Issue: Duplicate Email Error
**Solution**: Before migration, ensure all users have unique emails:
```python
python manage.py shell
from django.contrib.auth.models import User
# Find users without emails
users_no_email = User.objects.filter(email='')
for user in users_no_email:
    user.email = f"{user.username}@placeholder.local"
    user.save()
```

### Issue: Foreign Key Constraints
**Solution**: The migration script handles this by preserving IDs. Ensure all migrations run in order.

### Issue: Admin Login Fails
**Solution**: Update AUTHENTICATION_BACKENDS if needed:
```python
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]
```

## Production Deployment

1. **Schedule Maintenance Window**: This migration requires downtime
2. **Backup Everything**: Database + media files
3. **Test on Staging**: Run full migration on staging environment first
4. **Communicate**: Inform users they'll need to use email for login
5. **Monitor**: Watch logs closely after deployment
6. **Have Rollback Ready**: Keep backup accessible

## Support

If you encounter issues:
1. Check Django logs
2. Review migration files
3. Test with a fresh database
4. Contact the development team
