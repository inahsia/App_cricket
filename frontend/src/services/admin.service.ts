import ApiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { Booking, Sport, Slot } from '../types';

export const AdminService = {
  // Booking Management
  async getAllBookings(): Promise<Booking[]> {
    const response: any = await ApiService.get(API_ENDPOINTS.ADMIN_BOOKINGS);
    return response.results || response || [];
  },

  async cancelBooking(bookingId: number): Promise<void> {
    return await ApiService.post(`${API_ENDPOINTS.ADMIN_BOOKINGS}${bookingId}/cancel/`);
  },

  async updateBookingStatus(bookingId: number, status: string): Promise<void> {
    return await ApiService.patch(`${API_ENDPOINTS.ADMIN_BOOKINGS}${bookingId}/`, {
      status,
    });
  },

  // Sports Management
  async createSport(data: Partial<Sport>): Promise<Sport> {
    return await ApiService.post(API_ENDPOINTS.ADMIN_SPORTS, data);
  },

  async updateSport(id: number, data: Partial<Sport>): Promise<Sport> {
    return await ApiService.patch(`${API_ENDPOINTS.ADMIN_SPORTS}${id}/`, data);
  },

  async deleteSport(id: number): Promise<void> {
    return await ApiService.delete(`${API_ENDPOINTS.ADMIN_SPORTS}${id}/`);
  },

  // Slots Management
  async getAllSlots(): Promise<Slot[]> {
    const response: any = await ApiService.get(API_ENDPOINTS.ADMIN_SLOTS);
    return response.results || response || [];
  },

  async createSlot(data: Partial<Slot>): Promise<Slot> {
    return await ApiService.post(API_ENDPOINTS.ADMIN_SLOTS, data);
  },

  async updateSlot(id: number, data: Partial<Slot>): Promise<Slot> {
    return await ApiService.patch(`${API_ENDPOINTS.ADMIN_SLOTS}${id}/`, data);
  },

  async deleteSlot(id: number): Promise<void> {
    return await ApiService.delete(`${API_ENDPOINTS.ADMIN_SLOTS}${id}/`);
  },

  // Sports Management
  async getAllSports(): Promise<Sport[]> {
    const response: any = await ApiService.get(API_ENDPOINTS.ADMIN_SPORTS);
    // Handle paginated response from Django REST Framework
    return response.results || response || [];
  },

  async bulkCreateSlots(data: {
    sport: number;
    dates: string[];
    start_time: string;
    end_time: string;
    price: number;
    max_players: number;
  }): Promise<{ message: string; created_count: number }> {
    return await ApiService.post(API_ENDPOINTS.ADMIN_SLOTS_BULK_CREATE, data);
  },
};

export default AdminService;