import ApiService from './api.service';
import {User} from '../types';

class UserService {
  /**
   * Get current user's profile with QR code
   */
  async getMyProfile(): Promise<User> {
    const response = await ApiService.get<User>('/users/me/');
    return response;
  }

  /**
   * Scan user QR code (for admin scanning)
   */
  async scanUserQR(token: string): Promise<any> {
    const response = await ApiService.post('/users/scan_qr/', {token});
    return response;
  }
}

export default new UserService();
