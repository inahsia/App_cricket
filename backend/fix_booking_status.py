#!/usr/bin/env python
"""
Script to fix booking status for cancelled bookings
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redball_academy.settings')
django.setup()

from core.models import Booking

def fix_booking_status():
    """Update status for all cancelled bookings"""
    cancelled_bookings = Booking.objects.filter(is_cancelled=True)
    updated_count = 0
    
    for booking in cancelled_bookings:
        if booking.status != 'cancelled':
            booking.status = 'cancelled'
            booking.save()
            updated_count += 1
            print(f"Updated Booking #{booking.id} status to 'cancelled'")
    
    print(f"✅ Updated {updated_count} booking(s)")
    return updated_count

if __name__ == '__main__':
    try:
        fix_booking_status()
    except Exception as e:
        print(f"❌ Error: {e}")