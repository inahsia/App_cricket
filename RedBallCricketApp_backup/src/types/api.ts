export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export interface Sport {
  id: number;
  name: string;
  description: string;
  price_per_hour: string;
  max_players: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface Slot {
  id: number;
  sport: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  price: string;
}

export interface Booking {
  id: number;
  user: User;
  slot: Slot;
  sport: Sport;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  amount_paid: string;
  created_at: string;
  payment_status: 'pending' | 'completed' | 'failed';
}

export interface DashboardStats {
  total_bookings: number;
  active_users: number;
  total_revenue: number;
  active_sports: number;
  total_slots: number;
  upcoming_bookings: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}