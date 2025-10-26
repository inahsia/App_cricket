/**
 * Players API Service
 */

import ApiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { Player } from '../types';

type LegacyQRData = { player_id: number; booking_id: number; date: string };
type ScanQRPayload = { token: string } | { qr_data: LegacyQRData };

export const PlayersService = {
  /**
   * Get all players (Admin only)
   */
  async getAllPlayers(): Promise<Player[]> {
    return await ApiService.get<Player[]>(API_ENDPOINTS.PLAYERS);
  },

  /**
   * Get player profile (Current player)
   */
  async getMyProfile(): Promise<Player> {
    return await ApiService.get<Player>(API_ENDPOINTS.PLAYER_PROFILE);
  },

  /**
   * Get player by ID
   */
  async getPlayerById(id: number): Promise<Player> {
    return await ApiService.get<Player>(`${API_ENDPOINTS.PLAYERS}${id}/`);
  },

  /**
   * Scan QR code for check-in/out
   */
  async scanQR(data: ScanQRPayload): Promise<{ 
    message: string;
    action: string;
    player: Player;
  }> {
    return await ApiService.post(API_ENDPOINTS.SCAN_QR, data);
  },

  /**
   * Bulk register players to a booking
   */
  async bulkRegister(bookingId: number, players: Array<{ name: string; email: string; phone?: string }>): Promise<{
    created: number;
    players: Player[];
    errors: any[];
  }> {
    return await ApiService.post(API_ENDPOINTS.PLAYERS_REGISTER_FORM, {
      booking: bookingId,
      players,
    });
  },

  /**
   * Update player
   */
  async updatePlayer(id: number, data: Partial<Player>): Promise<Player> {
    return await ApiService.patch<Player>(
      `${API_ENDPOINTS.PLAYERS}${id}/`,
      data
    );
  },
};

export default PlayersService;
