/**
 * Booking Configuration Service
 */

import ApiService from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface CreateBookingConfigData {
  sport: number;
  opens_at: string;
  closes_at: string;
  slot_duration: 30 | 60 | 120 | 240;
  advance_booking_days: 1 | 3 | 7 | 15 | 30;
  min_booking_duration: number;
  max_booking_duration: number;
  buffer_time: number;
  different_weekend_timings: boolean;
  weekend_opens_at?: string | null;
  weekend_closes_at?: string | null;
  peak_hour_pricing: boolean;
  peak_start_time?: string | null;
  peak_end_time?: string | null;
  peak_price_multiplier: number;
  weekend_pricing: boolean;
  weekend_price_multiplier: number;
}

export interface BookingConfig extends CreateBookingConfigData {
  id: number;
  sport_name?: string;
  total_slots_per_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlotPreview {
  time: string;
  end_time: string;
  is_available: boolean;
  is_break: boolean;
  is_booked: boolean;
  price: string;
  reason?: string;
  time_category?: 'morning' | 'afternoon' | 'evening';
}

export interface SlotPreviewResponse {
  date: string;
  is_blackout_date: boolean;
  reason?: string;
  slots: SlotPreview[];
  grouped_slots: {
    morning: SlotPreview[];
    afternoon: SlotPreview[];
    evening: SlotPreview[];
  };
  total_slots: number;
  bookable_slots: number;
  break_slots: number;
  configuration: BookingConfig;
}

export interface BreakTime {
  id: number;
  sport: number;
  start_time: string;
  end_time: string;
  reason: string;
  applies_to_weekdays: boolean;
  applies_to_weekends: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const BookingConfigService = {
  /**
   * Get booking configuration for a sport
   */
  async getBookingConfig(sportId: number): Promise<BookingConfig | null> {
    try {
      if (__DEV__) {
        console.log('🔍 Fetching booking config for sport:', sportId);
      }
      const response = await ApiService.get<any>(
        `${API_ENDPOINTS.BOOKING_CONFIG}?sport=${sportId}`
      );
      
      if (__DEV__) {
        console.log('📦 Raw API response:', response);
        console.log('📦 Response type:', typeof response);
        console.log('📦 Is array:', Array.isArray(response));
        console.log('📦 Response keys:', response ? Object.keys(response) : 'null');
      }
      
      // Handle different response formats
      let configs: BookingConfig[] = [];
      
      if (Array.isArray(response)) {
        configs = response;
      } else if (response && Array.isArray(response.results)) {
        configs = response.results;
      } else if (response && typeof response === 'object') {
        // Single object response
        configs = [response];
      }
      
      const config = configs.length > 0 ? configs[0] : null;
      
      if (__DEV__) {
        console.log('📋 Parsed configs array:', configs);
        console.log('📋 Selected config:', config);
      }
      
      return config;
    } catch (error: any) {
      if (__DEV__) {
        console.log('❌ Error fetching booking config for sport:', sportId);
        console.log('❌ Error details:', error.response?.data || error.message);
      }
      // Return null instead of throwing when config doesn't exist
      if (error.response?.status === 404 || !error.response) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create new booking configuration
   */
  async create(data: CreateBookingConfigData): Promise<BookingConfig> {
    try {
      if (__DEV__) {
        console.log('Creating booking config with data:', data);
      }
      const response = await ApiService.post<BookingConfig>(API_ENDPOINTS.BOOKING_CONFIG, data);
      if (__DEV__) {
        console.log('Booking config creation response:', response);
      }
      return response;
    } catch (error: any) {
      console.error('Error creating booking config:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update booking configuration
   */
  async updateBookingConfig(configId: number | undefined, data: Partial<BookingConfig>): Promise<BookingConfig> {
    if (!configId) {
      throw new Error('Configuration ID is required for updates');
    }
    try {
      if (__DEV__) {
        console.log('Updating booking config:', configId, 'with data:', data);
      }
      const response = await ApiService.patch<BookingConfig>(
        `${API_ENDPOINTS.BOOKING_CONFIG}${configId}/`,
        data
      );
      if (__DEV__) {
        console.log('Booking config update response:', response);
      }
      return response;
    } catch (error: any) {
      console.error('Error updating booking config:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get break times for a sport
   */
  async getBreakTimes(sportId: number): Promise<BreakTime[]> {
    try {
      if (__DEV__) {
        console.log('Fetching break times for sport:', sportId);
      }
      const response = await ApiService.get<BreakTime[]>(
        `${API_ENDPOINTS.BREAK_TIMES}?sport=${sportId}`
      );
      if (__DEV__) {
        console.log('Break times response:', response);
      }
      return response;
    } catch (error: any) {
      console.error('Error fetching break times:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Create break time
   */
  async createBreakTime(data: Omit<BreakTime, 'id' | 'created_at' | 'updated_at'>): Promise<BreakTime> {
    try {
      if (__DEV__) {
        console.log('Creating break time with data:', data);
      }
      const response = await ApiService.post<BreakTime>(API_ENDPOINTS.BREAK_TIMES, data);
      if (__DEV__) {
        console.log('Break time creation response:', response);
      }
      return response;
    } catch (error: any) {
      console.error('Error creating break time:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update break time
   */
  async updateBreakTime(breakTimeId: number, data: Partial<BreakTime>): Promise<BreakTime> {
    try {
      if (__DEV__) {
        console.log('Updating break time:', breakTimeId, 'with data:', data);
      }
      const response = await ApiService.patch<BreakTime>(
        `${API_ENDPOINTS.BREAK_TIMES}${breakTimeId}/`,
        data
      );
      if (__DEV__) {
        console.log('Break time update response:', response);
      }
      return response;
    } catch (error: any) {
      console.error('Error updating break time:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete break time
   */
  async deleteBreakTime(breakTimeId: number): Promise<void> {
    try {
      if (__DEV__) {
        console.log('Deleting break time:', breakTimeId);
      }
      await ApiService.delete(`${API_ENDPOINTS.BREAK_TIMES}${breakTimeId}/`);
      if (__DEV__) {
        console.log('Break time deleted successfully');
      }
    } catch (error: any) {
      console.error('Error deleting break time:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Preview slots for a specific date
   */
  async previewSlots(configId: number, date: string): Promise<SlotPreviewResponse> {
    try {
      if (__DEV__) {
        console.log('Previewing slots for config:', configId, 'date:', date);
      }
      const response = await ApiService.get<SlotPreviewResponse>(
        `${API_ENDPOINTS.BOOKING_CONFIG}${configId}/preview/?date=${date}`
      );
      if (__DEV__) {
        console.log('Slot preview response:', response);
      }
      return response;
    } catch (error: any) {
      console.error('Error previewing slots:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default BookingConfigService;
