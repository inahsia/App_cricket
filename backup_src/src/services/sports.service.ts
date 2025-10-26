/**
 * Sports API Service
 */

import ApiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { Sport, Slot } from '../types';

export const SportsService = {
  /**
   * Get all sports
   */
  async getAllSports(): Promise<Sport[]> {
    const response: any = await ApiService.get<any>(API_ENDPOINTS.SPORTS);
    // Handle paginated response from Django REST Framework
    return response.results || response || [];
  },

  /**
   * Get sport by ID
   */
  async getSportById(id: number): Promise<Sport> {
    return await ApiService.get<Sport>(`${API_ENDPOINTS.SPORTS}${id}/`);
  },

  /**
   * Get available slots for a sport
   */
  async getAvailableSlots(sportId: number): Promise<Slot[]> {
    return await ApiService.get<Slot[]>(
      API_ENDPOINTS.SPORT_AVAILABLE_SLOTS(sportId)
    );
  },

  /**
   * Create new sport (Admin only)
   */
  async createSport(data: Partial<Sport>): Promise<Sport> {
    return await ApiService.post<Sport>(API_ENDPOINTS.SPORTS, data);
  },

  /**
   * Update sport (Admin only)
   */
  async updateSport(id: number, data: Partial<Sport>): Promise<Sport> {
    return await ApiService.patch<Sport>(
      `${API_ENDPOINTS.SPORTS}${id}/`,
      data
    );
  },

  /**
   * Delete sport (Admin only)
   */
  async deleteSport(id: number): Promise<void> {
    return await ApiService.delete(`${API_ENDPOINTS.SPORTS}${id}/`);
  },
};

export default SportsService;
