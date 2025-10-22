/**
 * Bookings API Service
 */

import ApiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { Booking, Player } from '../types';

interface CreateBookingData {
  slot: number;
}

interface AddPlayersData {
  players: Array<{
    name: string;
    email: string;
    phone?: string;
  }>;
}

export const BookingsService = {
  /**
   * Get all bookings (Admin only)
   */
  async getAllBookings(): Promise<Booking[]> {
    return await ApiService.get<Booking[]>(API_ENDPOINTS.BOOKINGS);
  },

  /**
   * Get my bookings (Current user)
   */
  async getMyBookings(): Promise<Booking[]> {
    const response: any = await ApiService.get<any>(API_ENDPOINTS.MY_BOOKINGS);
    return response.results || response || [];
  },

  /**
   * Get booking by ID
   */
  async getBookingById(id: number): Promise<Booking> {
    return await ApiService.get<Booking>(`${API_ENDPOINTS.BOOKINGS}${id}/`);
  },

  /**
   * Create new booking
   */
  async createBooking(data: CreateBookingData): Promise<Booking> {
    return await ApiService.post<Booking>(API_ENDPOINTS.BOOKINGS, data);
  },

  /**
   * Add players to booking
   */
  async addPlayers(bookingId: number, data: AddPlayersData): Promise<{ created: number; players: Player[]; errors: any[] }> {
    return await ApiService.post(
      API_ENDPOINTS.PLAYERS_REGISTER_FORM,
      { booking: bookingId, players: data.players }
    );
  },

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: number, reason?: string): Promise<{ message: string }> {
    return await ApiService.post(
      API_ENDPOINTS.CANCEL_BOOKING(bookingId),
      { reason }
    );
  },

  /**
   * Update booking (Admin only)
   */
  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking> {
    return await ApiService.patch<Booking>(
      `${API_ENDPOINTS.BOOKINGS}${id}/`,
      data
    );
  },

  /**
   * Confirm payment for booking
   */
  async confirmPayment(bookingId: number): Promise<{ message: string; status: string }> {
    return await ApiService.post(
      `${API_ENDPOINTS.BOOKINGS}${bookingId}/confirm_payment/`,
      {}
    );
  },
};

export default BookingsService;
