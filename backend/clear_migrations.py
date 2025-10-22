"""
Clear migration records from django_migrations table
"""
import os
import django
import psycopg2
from decouple import config

# Get database connection details
db_config = {
    'dbname': config('DATABASE_NAME', default='redball_cricket_db'),
    'user': config('DATABASE_USER', default='postgres'),
    'password': config('DATABASE_PASSWORD', default='postgres'),
    'host': config('DATABASE_HOST', default='localhost'),
    'port': config('DATABASE_PORT', default='5432'),
}

print("=" * 60)
print("Clearing Migration Records")
print("=" * 60)

try:
    # Connect to database
    conn = psycopg2.connect(**db_config)
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Delete all migration records
    cursor.execute("DELETE FROM django_migrations;")
    print("✓ Cleared all migration records from django_migrations table")
    
    cursor.close()
    conn.close()
    
    print("\n✓ Migration records cleared successfully")
    print("\nNow run: python manage.py migrate --fake-initial")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    print("\nYou may need to check your database connection settings")
