/**
 * Authentication API Service
 */

import ApiService from './api.service';
import { API_ENDPOINTS, BASE_URL } from '../config/api';
import { AuthResponse, User } from '../types';
import StorageService from '../utils/storage';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export const AuthService = {
  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      if (__DEV__) {
        console.log('Login attempt:', {
          username: data.username,
          endpoint: API_ENDPOINTS.LOGIN,
          url: `${BASE_URL}${API_ENDPOINTS.LOGIN}`,
        });
      }
      
      const response = await ApiService.post<AuthResponse>(
        API_ENDPOINTS.LOGIN,
        {
          username: data.username,
          password: data.password
        }
      );
      
      console.log('Login successful with status:', response.status);
      
      if (response.token) {
        await StorageService.setAuthToken(response.token);
        await StorageService.setUserData(response.user);
        
        if (response.user.is_staff) {
          await StorageService.setUserRole('admin');
        } else {
          await StorageService.setUserRole('user');
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
      throw error;
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const debug = {...data, password: '[REDACTED]'};
      console.log('Registration data:', debug);
      
      const response = await ApiService.post<AuthResponse>(
        API_ENDPOINTS.REGISTER,
        data,
      );
      
      console.log('Registration success:', {...response, token: '[REDACTED]'});
      
      if (response.token) {
        await StorageService.setAuthToken(response.token);
        await StorageService.setUserData(response.user);
        await StorageService.setUserRole('user');
      }
      
      return response;
    } catch (error: any) {
      console.error('Registration error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await StorageService.clearAll();
  },

  /**
   * Get current user data from storage
   */
  async getCurrentUser(): Promise<User | null> {
    return await StorageService.getUserData();
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await StorageService.getAuthToken();
    return !!token;
  },

  /**
   * Get user role
   */
  async getUserRole(): Promise<string | null> {
    return await StorageService.getUserRole();
  },
};

export default AuthService;
