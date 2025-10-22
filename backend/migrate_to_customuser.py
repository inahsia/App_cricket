"""
Script to help migrate from default User to CustomUser model.
Run this BEFORE applying migrations to prepare existing user data.
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redball_academy.settings')
django.setup()

from django.contrib.auth.models import User


def check_users_for_migration():
    """Check if users need email updates before migration"""
    print("Checking existing users...")
    
    users_without_email = User.objects.filter(email='')
    users_duplicate_email = []
    
    if users_without_email.exists():
        print(f"\n⚠️  Found {users_without_email.count()} users without email addresses:")
        for user in users_without_email:
            print(f"  - {user.username} (ID: {user.id})")
        print("\nThese users need email addresses assigned.")
        
        response = input("\nDo you want to auto-assign placeholder emails? (yes/no): ")
        if response.lower() == 'yes':
            for user in users_without_email:
                user.email = f"{user.username}@placeholder.local"
                user.save()
                print(f"  ✓ Assigned {user.email} to {user.username}")
            print("\n✓ All users now have email addresses.")
    
    # Check for duplicate emails
    from django.db.models import Count
    duplicate_emails = User.objects.values('email').annotate(
        count=Count('email')
    ).filter(count__gt=1, email__isnull=False).exclude(email='')
    
    if duplicate_emails:
        print(f"\n⚠️  Found duplicate emails:")
        for item in duplicate_emails:
            users = User.objects.filter(email=item['email'])
            print(f"  - {item['email']} ({item['count']} users):")
            for user in users:
                print(f"    • {user.username} (ID: {user.id})")
        print("\n⚠️  You need to resolve duplicate emails before migration.")
        print("   Each email must be unique for CustomUser model.")
        return False
    
    print("\n✓ All users have unique email addresses.")
    print(f"✓ Total users ready for migration: {User.objects.count()}")
    return True


def create_backup():
    """Create a JSON backup of user data"""
    print("\n📦 Creating backup of user data...")
    os.system('python manage.py dumpdata auth.User core.UserProfile --indent 2 > users_backup.json')
    print("✓ Backup created: users_backup.json")


if __name__ == '__main__':
    print("=" * 60)
    print("CustomUser Migration Pre-Check Script")
    print("=" * 60)
    
    try:
        ready = check_users_for_migration()
        
        if ready:
            response = input("\nDo you want to create a backup? (recommended) (yes/no): ")
            if response.lower() == 'yes':
                create_backup()
            
            print("\n" + "=" * 60)
            print("✓ Pre-check complete! You can now run migrations:")
            print("=" * 60)
            print("\n  1. python manage.py makemigrations")
            print("  2. python manage.py migrate")
            print("\nNote: Django will handle the user data migration automatically.")
            print("The CustomUser model will inherit existing user data.")
        else:
            print("\n" + "=" * 60)
            print("❌ Please fix the issues above before migrating.")
            print("=" * 60)
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
