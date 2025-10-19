/**
 * TypeScript type definitions
 */

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
}

export interface Sport {
  id: number;
  name: string;
  price_per_hour: string;
  description?: string;
  is_active: boolean;
  available_slots_count: number;
  created_at: string;
  updated_at: string;
}

export interface Slot {
  id: number;
  sport: number;
  sport_name: string;
  sport_details?: Sport;
  date: string;
  start_time: string;
  end_time: string;
  price: string;
  is_booked: boolean;
  max_players: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: number;
  booking: number;
  name: string;
  email: string;
  phone?: string;
  qr_code?: string;
  qr_code_url?: string;
  check_in_count: number;
  status: string;
  last_check_in?: string;
  last_check_out?: string;
  booking_details: {
    id: number;
    slot_date: string;
    sport: string;
    start_time: string;
    end_time: string;
  };
  created_at: string;
}

export interface Booking {
  id: number;
  user: number;
  user_details: User;
  slot: number;
  slot_details: Slot;
  players: Player[];
  player_count: number;
  created_at: string;
  updated_at: string;
  payment_verified: boolean;
  payment_id?: string;
  order_id?: string;
  amount_paid?: string;
  is_cancelled: boolean;
  cancellation_reason?: string;
}

export interface PaymentOrder {
  order_id: string;
  amount: number;
  currency: string;
  booking_id: number;
}

export interface DashboardStats {
  total_bookings: number;
  total_revenue: string;
  active_bookings: number;
  total_players: number;
  sports_count: number;
  slots_count: number;
  available_slots: number;
  booked_slots: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
