"""
URL Configuration for Core app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sports', views.SportViewSet, basename='sport')
router.register(r'slots', views.SlotViewSet, basename='timeslot')
router.register(r'bookings', views.BookingViewSet, basename='booking')
router.register(r'players', views.PlayerViewSet, basename='player')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/jwt_login/', views.jwt_login, name='jwt_login'),
    path('auth/jwt_register/', views.jwt_register, name='jwt_register'),
    
    # Payment endpoints
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
]
