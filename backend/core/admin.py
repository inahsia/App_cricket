"""
Admin configuration for Red Ball Cricket Academy
"""
from django.contrib import admin
from .models import Sport, Slot, Booking, Player, CheckInLog


@admin.register(Sport)
class SportAdmin(admin.ModelAdmin):
    list_display = ['name', 'price_per_hour', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Slot)
class SlotAdmin(admin.ModelAdmin):
    list_display = ['sport', 'date', 'start_time', 'end_time', 'price', 'is_booked', 'max_players']
    list_filter = ['sport', 'is_booked', 'date']
    search_fields = ['sport__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'slot', 'payment_verified', 'is_cancelled', 'created_at']
    list_filter = ['payment_verified', 'is_cancelled', 'created_at']
    search_fields = ['user__username', 'user__email', 'payment_id', 'order_id']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['user', 'slot']


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'booking', 'check_in_count', 'get_status', 'created_at']
    list_filter = ['check_in_count', 'created_at']
    search_fields = ['name', 'email', 'phone']
    readonly_fields = ['qr_code', 'created_at', 'last_check_in', 'last_check_out']
    raw_id_fields = ['booking', 'user']


@admin.register(CheckInLog)
class CheckInLogAdmin(admin.ModelAdmin):
    list_display = ['player', 'action', 'timestamp', 'location']
    list_filter = ['action', 'timestamp']
    search_fields = ['player__name', 'player__email']
    readonly_fields = ['timestamp']
    raw_id_fields = ['player']
