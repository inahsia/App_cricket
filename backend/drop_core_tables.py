"""
Drop all core tables to allow clean migration
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redball_academy.settings')
django.setup()

from django.db import connection

def drop_core_tables():
    """Drop all core app tables"""
    with connection.cursor() as cursor:
        tables_to_drop = [
            'core_checkinlog',
            'core_player',
            'core_booking',
            'core_timeslot',
            'core_sport',
            'core_userprofile',
            'core_customuser_groups',
            'core_customuser_user_permissions',
            'core_customuser',
        ]
        
        for table in tables_to_drop:
            try:
                cursor.execute(f'DROP TABLE IF EXISTS {table} CASCADE;')
                print(f'✓ Dropped {table}')
            except Exception as e:
                print(f'✗ Error dropping {table}: {e}')
        
        print('\n✓ All core tables dropped')
        print('\nNow run: python manage.py migrate')

if __name__ == '__main__':
    print("=" * 60)
    print("Dropping Core App Tables")
    print("=" * 60)
    drop_core_tables()
