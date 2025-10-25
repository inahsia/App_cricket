import { Platform } from 'react-native';

export const BASE_URL = __DEV__ 
  ? Platform.select({
      android: 'http://10.0.2.2:8000/api',
      ios: 'http://localhost:8000/api',
      default: 'http://10.0.2.2:8000/api'
    })
  : 'https://your-production-url.com/api';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  
  // Sports
  SPORTS: '/sports/',
  SPORT_AVAILABLE_SLOTS: (id: number) => `/sports/${id}/available_slots/`,
  
  // Slots
  SLOTS: '/slots/',
  SLOT_BULK_CREATE: '/slots/bulk_create/',
  
  // Bookings
  BOOKINGS: '/bookings/',
  MY_BOOKINGS: '/bookings/my_bookings/',
  CANCEL_BOOKING: (id: number) => `/bookings/${id}/cancel/`,
  
  // Players
  PLAYERS: '/players/',
  PLAYER_PROFILE: '/players/my_profile/',
  SCAN_QR: '/players/scan_qr/',
  
  // Payments
  CREATE_PAYMENT_ORDER: '/payments/create-order/',
  VERIFY_PAYMENT: '/payments/verify/',
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats/',
};