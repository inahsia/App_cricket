# Migration Strategy for CustomUser

## Problem
The database already has data with `auth.User` references, but we want to switch to `core.CustomUser`.

## Solution Options

### Option 1: Fresh Database (Recommended for Development)
If you don't need to preserve existing data:

```bash
# 1. Drop and recreate database
psql -U postgres -c "DROP DATABASE redball_cricket_db;"
psql -U postgres -c "CREATE DATABASE redball_cricket_db;"

# 2. Delete all migration files except __init__.py
# Keep: core/migrations/__init__.py
# Delete: core/migrations/0001_*.py through 0005_*.py

# 3. Recreate migrations
python manage.py makemigrations

# 4. Apply migrations
python manage.py migrate

# 5. Create superuser with email
python manage.py createsuperuser
```

### Option 2: Preserve Existing Data (Production)
If you need to keep existing users and bookings:

```bash
# 1. Backup database first!
pg_dump -U postgres redball_cricket_db > backup_$(date +%Y%m%d).sql

# 2. Comment out AUTH_USER_MODEL temporarily
# In settings.py, comment out: # AUTH_USER_MODEL = 'core.CustomUser'

# 3. Revert to using default User in models.py
# Change all ForeignKey('CustomUser') back to ForeignKey(User)
# Import: from django.contrib.auth.models import User

# 4. Make sure you're on migration 0004
python manage.py migrate core 0004

# 5. Delete migration 0005_customuser.py
rm core/migrations/0005_customuser.py

# 6. Now restore CustomUser in models.py and uncomment AUTH_USER_MODEL

# 7. Create new migrations
python manage.py makemigrations

# 8. Create data migration to copy User to CustomUser
python manage.py makemigrations core --empty --name copy_user_to_customuser

# Edit the migration to copy data (see template below)

# 9. Apply migrations
python manage.py migrate
```

## Data Migration Template

Edit the generated migration file `core/migrations/000X_copy_user_to_customuser.py`:

```python
from django.db import migrations


def copy_users_forward(apps, schema_editor):
    """Copy auth.User data to core.CustomUser"""
    User = apps.get_model('auth', 'User')
    CustomUser = apps.get_model('core', 'CustomUser')
    
    for old_user in User.objects.all():
        email = old_user.email if old_user.email else f"{old_user.username}@placeholder.local"
        
        CustomUser.objects.create(
            id=old_user.id,  # Preserve ID to maintain FK relationships
            email=email,
            password=old_user.password,
            first_name=old_user.first_name,
            last_name=old_user.last_name,
            is_staff=old_user.is_staff,
            is_active=old_user.is_active,
            is_superuser=old_user.is_superuser,
            date_joined=old_user.date_joined,
            last_login=old_user.last_login,
        )
    
    print(f"Migrated {User.objects.count()} users to CustomUser")


def copy_users_backward(apps, schema_editor):
    """Reverse migration"""
    CustomUser = apps.get_model('core', 'CustomUser')
    CustomUser.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ('core', '000X_previous_migration'),  # Update this
        ('auth', '0012_alter_user_first_name_max_length'),
    ]
    
    operations = [
        migrations.RunPython(copy_users_forward, copy_users_backward),
    ]
```

## Current Recommendation

Since this is a development environment, I recommend **Option 1** (fresh database).

Run these commands:

```bash
cd c:\cricket_acadmy\backend

# Drop database (you'll lose all data!)
psql -U postgres -c "DROP DATABASE IF EXISTS redball_cricket_db;"
psql -U postgres -c "CREATE DATABASE redball_cricket_db;"

# Delete old migrations
Remove-Item core\migrations\0001_*.py, core\migrations\0002_*.py, core\migrations\0003_*.py, core\migrations\0004_*.py, core\migrations\0005_*.py

# Recreate from scratch
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Enter email: admin@redball.com
# Enter password: (your password)
```

This will give you a clean database with CustomUser from the start.
