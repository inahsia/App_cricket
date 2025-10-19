"""
URL Configuration for Core app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sports', views.SportViewSet, basename='sport')
router.register(r'slots', views.SlotViewSet, basename='slot')
router.register(r'bookings', views.BookingViewSet, basename='booking')
router.register(r'players', views.PlayerViewSet, basename='player')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    
    # Payment endpoints
    path('payments/create-order/', views.create_payment_order, name='create_payment_order'),
    path('payments/verify/', views.verify_payment, name='verify_payment'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
]
