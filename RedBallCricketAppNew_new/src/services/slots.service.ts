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
}

interface BulkSlotData {
  sport: number;
  start_date: string;
  end_date: string;
  time_slots: Array<{
    start_time: string;
    end_time: string;
  }>;
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
    if (filters?.available !== undefined) {
      params.append('available', filters.available.toString());
    }
    
    const url = params.toString() 
      ? `${API_ENDPOINTS.SLOTS}?${params.toString()}`
      : API_ENDPOINTS.SLOTS;
    
    return await ApiService.get<Slot[]>(url);
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
  async bulkCreateSlots(data: BulkSlotData): Promise<{ message: string; created_count: number }> {
    return await ApiService.post(API_ENDPOINTS.SLOT_BULK_CREATE, data);
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
};

export default SlotsService;
