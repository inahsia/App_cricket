"""
Drop ALL tables from the database and start fresh
"""
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
print("Dropping ALL Tables from Database")
print("=" * 60)

try:
    # Connect to database
    conn = psycopg2.connect(**db_config)
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Get all table names
    cursor.execute("""
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
    """)
    tables = cursor.fetchall()
    
    if not tables:
        print("No tables found in database")
    else:
        # Drop all tables
        for table in tables:
            table_name = table[0]
            try:
                cursor.execute(f"DROP TABLE IF EXISTS {table_name} CASCADE;")
                print(f"✓ Dropped {table_name}")
            except Exception as e:
                print(f"✗ Failed to drop {table_name}: {e}")
    
    cursor.close()
    conn.close()
    
    print("\n✓ All tables dropped successfully")
    print("\nNow run: python manage.py migrate")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    print("\nYou may need to check your database connection settings")
