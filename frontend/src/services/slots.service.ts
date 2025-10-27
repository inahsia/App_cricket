/**
 * Slots API Service
 */

import ApiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { Slot } from '../types';

interface SlotFilters {
  sport?: number;
  date?: string;
  available?: boolean;
  start_date?: string;
  end_date?: string;
}

interface BulkSlotData {
  sport: number;
  start_date: string;
  end_date: string;
  // Optional: Manual time slots (if not provided, will use booking config)
  time_slots?: Array<{
    start_time: string;
    end_time: string;
  }>;
  // Optional: Booking config details (for automatic generation)
  opens_at?: string;
  closes_at?: string;
  slot_duration?: 30 | 60 | 120 | 240;
  buffer_time?: number;
  weekend_opens_at?: string | null;
  weekend_closes_at?: string | null;
}

export interface BlackoutDate {
  id: number;
  sport: number;
  sport_name?: string;
  date: string;
  reason: string;
  created_at: string;
}

export const SlotsService = {
  /**
   * Get all slots with optional filters
   */
  async getAllSlots(filters?: SlotFilters): Promise<Slot[]> {
    const params = new URLSearchParams();
    
    if (filters?.sport) {
      params.append('sport', filters.sport.toString());
    }
    if (filters?.date) {
      params.append('date', filters.date);
    }
    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters?.available !== undefined) {
      params.append('available', filters.available.toString());
    }
    
    const url = params.toString() 
      ? `${API_ENDPOINTS.SLOTS}?${params.toString()}`
      : API_ENDPOINTS.SLOTS;
    
    const response: any = await ApiService.get<any>(url);
    return response.results || response || [];
  },

  /**
   * Get slot by ID
   */
  async getSlotById(id: number): Promise<Slot> {
    return await ApiService.get<Slot>(`${API_ENDPOINTS.SLOTS}${id}/`);
  },

  /**
   * Create new slot (Admin only)
   */
  async createSlot(data: Partial<Slot>): Promise<Slot> {
    return await ApiService.post<Slot>(API_ENDPOINTS.SLOTS, data);
  },

  /**
   * Bulk create slots (Admin only)
   */
  async bulkCreateSlots(data: BulkSlotData): Promise<{ message: string; created_count: number; slots: Slot[] }> {
    return await ApiService.post(`${API_ENDPOINTS.SLOTS}bulk_create/`, data);
  },

  /**
   * Update slot (Admin only)
   */
  async updateSlot(id: number, data: Partial<Slot>): Promise<Slot> {
    return await ApiService.patch<Slot>(
      `${API_ENDPOINTS.SLOTS}${id}/`,
      data
    );
  },

  /**
   * Delete slot (Admin only)
   */
  async deleteSlot(id: number): Promise<void> {
    return await ApiService.delete(`${API_ENDPOINTS.SLOTS}${id}/`);
  },

  /**
   * Get blackout dates
   */
  async getBlackoutDates(sportId?: number): Promise<BlackoutDate[]> {
    try {
      let url = API_ENDPOINTS.BLACKOUT_DATES;
      if (sportId) {
        url += `?sport=${sportId}`;
      }
      console.log('🔍 Fetching blackout dates from:', url);
      const response = await ApiService.get<BlackoutDate[]>(url);
      console.log('📅 Blackout dates response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error fetching blackout dates:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      return [];
    }
  },

  /**
   * Create blackout date
   */
  async createBlackoutDate(data: {
    sport: number;
    date: string;
    reason: string;
  }): Promise<BlackoutDate> {
    return await ApiService.post<BlackoutDate>(API_ENDPOINTS.BLACKOUT_DATES, data);
  },

  /**
   * Delete blackout date
   */
  async deleteBlackoutDate(id: number): Promise<void> {
    return await ApiService.delete(`${API_ENDPOINTS.BLACKOUT_DATES}${id}/`);
  },
};

export default SlotsService;
