import {Platform} from 'react-native';

const isDevelopment = __DEV__;
const DEV_ANDROID_URL = 'http://10.0.2.2:8000'; // Android Emulator
const DEV_IOS_URL = 'http://localhost:8000'; // iOS Simulator
const PROD_URL = 'https://your-production-url.com'; // Production URL

export const BASE_URL = `${
  isDevelopment
    ? Platform.select({
        android: DEV_ANDROID_URL,
        ios: DEV_IOS_URL,
        default: DEV_ANDROID_URL,
      })
    : PROD_URL
}/api`;

export const API_ENDPOINTS = {
  // Authentication
  REGISTER: '/auth/jwt_register/',
  LOGIN: '/auth/jwt_login/',
  
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
  // Player bulk registration (by booking)
  PLAYERS_REGISTER_FORM: '/players/register_form/',
  
  // Players
  PLAYERS: '/players/',
  PLAYER_PROFILE: '/players/me/',
  SCAN_QR: '/players/scan_qr/',
  
  // Payments
  CREATE_PAYMENT_ORDER: '/payments/create-order/',
  VERIFY_PAYMENT: '/payments/verify/',
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats/',

  // Admin Endpoints (use same endpoints as regular users, backend handles permissions)
  ADMIN_BOOKINGS: '/bookings/',
  ADMIN_SPORTS: '/sports/',
  ADMIN_SLOTS: '/slots/',
  ADMIN_SLOTS_BULK_CREATE: '/slots/bulk_create/',
  ADMIN_USERS: '/users/',
};

export default {
  BASE_URL,
  API_ENDPOINTS,
};
