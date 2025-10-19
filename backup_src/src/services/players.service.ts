/**
 * Players API Service
 */

import ApiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { Player } from '../types';

interface ScanQRData {
  qr_data: string;
}

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
  async scanQR(data: ScanQRData): Promise<{ 
    message: string;
    action: string;
    player: Player;
  }> {
    return await ApiService.post(API_ENDPOINTS.SCAN_QR, data);
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
