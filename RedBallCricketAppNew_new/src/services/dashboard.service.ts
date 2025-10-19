/**
 * Dashboard API Service
 */

import ApiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { DashboardStats } from '../types';

export const DashboardService = {
  /**
   * Get dashboard statistics (Admin only)
   */
  async getStats(): Promise<DashboardStats> {
    return await ApiService.get<DashboardStats>(API_ENDPOINTS.DASHBOARD_STATS);
  },
};

export default DashboardService;
