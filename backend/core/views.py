"""
Views for Red Ball Cricket Academy API
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.db import transaction
import razorpay
import hmac
import hashlib
import json
from datetime import datetime, timedelta

from .models import Sport, TimeSlot, Booking, Player, CheckInLog, UserProfile
from .serializers import (
    SportSerializer, TimeSlotSerializer, BookingSerializer, 
    PlayerSerializer, CheckInLogSerializer, UserSerializer,
    BookingCreateSerializer, PlayerCreateSerializer,
    QRCodeScanSerializer, PaymentOrderSerializer, PaymentVerificationSerializer
)
# JWT login endpoint
@api_view(['POST'])
@permission_classes([AllowAny])
def jwt_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        profile = getattr(user, 'profile', None)
        user_type = profile.user_type if profile else 'customer'
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'user_type': user_type,
            'is_staff': user.is_staff
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# JWT register endpoint
@api_view(['POST'])
@permission_classes([AllowAny])
def jwt_register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    user_type = request.data.get('user_type', 'customer')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    if not username or not email or not password:
        return Response({'error': 'Username, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    # Set user_type in profile
    profile = getattr(user, 'profile', None)
    if profile:
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


# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class SportViewSet(viewsets.ModelViewSet):
    """ViewSet for Sport CRUD operations"""
    queryset = Sport.objects.filter(is_active=True)
    serializer_class = SportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """Admin can create/update/delete, authenticated users can view"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUser()]
        return [AllowAny()]

    @action(detail=True, methods=['get'])
    def available_slots(self, request, pk=None):
        """Get available slots for a specific sport"""
        sport = self.get_object()
        today = timezone.now().date()
        slots = sport.slots.filter(
            is_booked=False,
            date__gte=today
        ).order_by('date', 'start_time')
        serializer = TimeSlotSerializer(slots, many=True, context={'request': request})
        return Response(serializer.data)


class SlotViewSet(viewsets.ModelViewSet):
    """ViewSet for Slot CRUD operations"""
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer

    def get_permissions(self):
        """Admin can create/update/delete, others can only view"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        """Filter slots based on query parameters"""
        queryset = TimeSlot.objects.all()

        # Filter by sport
        sport_id = self.request.query_params.get('sport', None)
        if sport_id:
            queryset = queryset.filter(sport_id=sport_id)

        # Filter by date
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(date=date)

        # Filter by availability
        available = self.request.query_params.get('available', None)
        if available and available.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(is_booked=False, date__gte=today)
        
        # Log the query for debugging
        print(f"Slots Query - Sport: {sport_id}, Available: {available}, Count: {queryset.count()}")

        return queryset.order_by('date', 'start_time')

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple slots at once (Admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TimeSlotSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Confirm payment for a booking and update status"""
        booking = self.get_object()
        booking.payment_verified = True
        booking.save()
        return Response({'message': 'Payment confirmed', 'status': booking.status})
    """ViewSet for Booking operations"""
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users see their own bookings, admins see all"""
        if self.request.user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Get current user's bookings"""
        bookings = self.get_queryset().order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True, context={'request': request})
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Create a new booking"""
        serializer = BookingCreateSerializer(data=request.data)
        if serializer.is_valid():
            slot = serializer.validated_data['slot']
            
            # Double-check slot availability
            if slot.is_booked:
                return Response(
                    {'error': 'This slot has already been booked. Please select another slot.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create booking
            booking = Booking.objects.create(
                user=request.user,
                slot=slot,
                amount_paid=slot.price
            )
            
            # Mark slot as booked
            slot.is_booked = True
            slot.save()
            
            # Return full booking details
            response_serializer = BookingSerializer(booking, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        # Check if user owns the booking or is admin
        if booking.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to cancel this booking'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if booking is already cancelled
        if booking.is_cancelled:
            return Response(
                {'error': 'Booking is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', 'Cancelled by user')
        booking.cancel_booking(reason)
        
        serializer = BookingSerializer(booking, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def players(self, request, pk=None):
        """Get all players for a booking"""
        booking = self.get_object()
        players = booking.players.all()
        serializer = PlayerSerializer(players, many=True, context={'request': request})
        return Response(serializer.data)


class PlayerViewSet(viewsets.ModelViewSet):
    """ViewSet for Player operations"""
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter based on user role"""
        if self.request.user.is_staff:
            return Player.objects.all()
        
        # Users see players from their bookings
        return Player.objects.filter(booking__user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a new player and generate account"""
        serializer = PlayerCreateSerializer(data=request.data)
        if serializer.is_valid():
            booking_id = serializer.validated_data['booking'].id
            
            # Verify booking belongs to user
            booking = get_object_or_404(Booking, id=booking_id)
            if booking.user != request.user and not request.user.is_staff:
                return Response(
                    {'error': 'You do not have permission to add players to this booking'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if payment is verified
            if not booking.payment_verified:
                return Response(
                    {'error': 'Payment must be verified before adding players'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create user account for player
            email = serializer.validated_data['email']
            username = email.split('@')[0] + str(booking_id)
            
            try:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='redball',
                    first_name=serializer.validated_data['name']
                )
            except:
                # User might already exist
                user = User.objects.filter(email=email).first()
            
            # Create player
            player = serializer.save(user=user)
            
            # Generate QR code
            player.generate_qr_code()
            player.save()
            
            response_serializer = PlayerSerializer(player, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        """Get QR code for player"""
        player = self.get_object()
        if player.qr_code:
            return Response({
                'qr_code_url': request.build_absolute_uri(player.qr_code.url),
                'booking_date': player.booking.slot.date,
                'status': player.get_status()
            })
        return Response(
            {'error': 'QR code not generated'},
            status=status.HTTP_404_NOT_FOUND
        )

    @action(detail=False, methods=['post'])
    def scan_qr(self, request):
        """Scan QR code for check-in/out"""
        serializer = QRCodeScanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        qr_data = serializer.validated_data['qr_data']
        player_id = qr_data.get('player_id')
        booking_date = qr_data.get('date')
        
        try:
            player = Player.objects.get(id=player_id)
        except Player.DoesNotExist:
            return Response(
                {'error': 'Invalid QR code'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if booking date matches today
        today = str(timezone.now().date())
        if booking_date != today:
            return Response(
                {'error': f'This QR code is valid only for {booking_date}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check in/out
        if player.check_in_count == 0:
            # First scan - Check In
            player.check_in()
            CheckInLog.objects.create(player=player, action='IN')
            message = 'Successfully checked in'
        elif player.check_in_count == 1:
            # Second scan - Check Out
            player.check_in()
            CheckInLog.objects.create(player=player, action='OUT')
            message = 'Successfully checked out'
        else:
            return Response(
                {'error': 'Maximum check-ins reached for today'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'message': message,
            'player': PlayerSerializer(player, context={'request': request}).data
        })




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics (Admin only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    today = timezone.now().date()
    
    logs = CheckInLog.objects.select_related('player').order_by('-timestamp')[:20]
    log_data = [
        {
            'player': log.player.name,
            'action': log.action,
            'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'booking_id': log.player.booking.id if log.player.booking else None,
        }
        for log in logs
    ]
    stats = {
        'total_bookings': Booking.objects.filter(payment_verified=True, is_cancelled=False).count(),
        'active_bookings': Booking.objects.filter(payment_verified=True, is_cancelled=False, slot__date__gte=today).count(),
        'total_revenue': sum([
            float(b.amount_paid) for b in Booking.objects.filter(payment_verified=True, is_cancelled=False) if b.amount_paid
        ]),
        'total_players': Player.objects.filter(booking__payment_verified=True, booking__is_cancelled=False).count(),
        'checked_in_today': Player.objects.filter(last_check_in__date=today, booking__payment_verified=True, booking__is_cancelled=False).count(),
        'available_slots': TimeSlot.objects.filter(is_booked=False, date__gte=today).count(),
        'sports_count': Sport.objects.filter(is_active=True).count(),
        'slots_count': TimeSlot.objects.filter(date__gte=today).count(),
        'recent_logs': log_data,
    }
    
    return Response(stats)
