"""
Models for Red Ball Cricket Academy Management System
"""
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
class UserProfile(models.Model):
    USER_TYPE_CHOICES = (
        ('admin', 'Admin'),
        ('customer', 'Customer'),
        ('player', 'Player'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='customer')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.user_type})"

# Automatically create or update UserProfile when User is saved
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        instance.profile.save()
from django.core.validators import MinValueValidator
from django.utils import timezone
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image
import json


class Sport(models.Model):
    """Sports offered by the academy"""
    name = models.CharField(max_length=100, unique=True)
    price_per_hour = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    description = models.TextField(blank=True, null=True)
    duration = models.IntegerField(default=60, validators=[MinValueValidator(1)], help_text="Duration in minutes")
    max_players = models.IntegerField(default=10, validators=[MinValueValidator(1)], help_text="Maximum number of players")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Sport'
        verbose_name_plural = 'Sports'

    def __str__(self):
        return f"{self.name} - ₹{self.price_per_hour}/hour"


class TimeSlot(models.Model):
    """Time slots for booking"""
    sport = models.ForeignKey(
        Sport, 
        on_delete=models.CASCADE, 
        related_name='slots'
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    is_booked = models.BooleanField(default=False)
    max_players = models.IntegerField(default=10, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['sport', 'date', 'start_time']
        verbose_name = 'Time Slot'
        verbose_name_plural = 'Time Slots'

    def __str__(self):
        return f"{self.sport.name} - {self.date} ({self.start_time} - {self.end_time})"

    def is_available(self):
        """Check if slot is available for booking"""
        return not self.is_booked and self.date >= timezone.now().date()


class Booking(models.Model):
    """Booking made by users"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='bookings'
    )
    slot = models.OneToOneField(
        TimeSlot, 
        on_delete=models.CASCADE, 
        related_name='booking'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment_verified = models.BooleanField(default=False)
    payment_id = models.CharField(max_length=255, blank=True, null=True)
    order_id = models.CharField(max_length=255, blank=True, null=True)
    amount_paid = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True,
        blank=True
    )
    is_cancelled = models.BooleanField(default=False)
    cancellation_reason = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'

    def __str__(self):
        return f"Booking #{self.id} - {self.user.username} - {self.slot}"

    def cancel_booking(self, reason=""):
        """Cancel the booking"""
        self.is_cancelled = True
        self.cancellation_reason = reason
        self.slot.is_booked = False
        self.slot.save()
        self.save()


class Player(models.Model):
    """Players associated with a booking"""
    booking = models.ForeignKey(
        Booking, 
        on_delete=models.CASCADE, 
        related_name='players'
    )
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15, blank=True, null=True)
    user = models.OneToOneField(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='player_profile'
    )
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    check_in_count = models.IntegerField(default=0)
    last_check_in = models.DateTimeField(null=True, blank=True)
    last_check_out = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Player'
        verbose_name_plural = 'Players'

    def __str__(self):
        return f"{self.name} ({self.email})"

    def generate_qr_code(self):
        """Generate QR code for player check-in"""
        qr_data = {
            'player_id': self.id,
            'booking_id': self.booking.id,
            'date': str(self.booking.slot.date),
            'name': self.name,
            'email': self.email
        }
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(json.dumps(qr_data))
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Save to model
        filename = f'player_{self.id}_qr.png'
        self.qr_code.save(filename, File(buffer), save=False)
        buffer.close()

    def can_check_in(self):
        """Check if player can check in today"""
        booking_date = self.booking.slot.date
        today = timezone.now().date()
        return booking_date == today and self.check_in_count < 2

    def check_in(self):
        """Mark player as checked in"""
        if self.can_check_in():
            self.check_in_count += 1
            if self.check_in_count == 1:
                self.last_check_in = timezone.now()
            elif self.check_in_count == 2:
                self.last_check_out = timezone.now()
            self.save()
            return True
        return False

    def get_status(self):
        """Get current check-in status"""
        if self.check_in_count == 0:
            return "Not Checked In"
        elif self.check_in_count == 1:
            return "Checked In"
        else:
            return "Checked Out"


class CheckInLog(models.Model):
    """Log of check-in/check-out activities"""
    player = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, 
        related_name='check_logs'
    )
    action = models.CharField(
        max_length=10,
        choices=[('IN', 'Check In'), ('OUT', 'Check Out')]
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Check-In Log'
        verbose_name_plural = 'Check-In Logs'

    def __str__(self):
        return f"{self.player.name} - {self.action} at {self.timestamp}"
