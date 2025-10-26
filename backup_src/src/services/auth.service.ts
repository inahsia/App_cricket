/**
 * Authentication API Service
 */

import ApiService from './api.service';
import { API_ENDPOINTS, BASE_URL } from '../config/api';
import { AuthResponse, User } from '../types';
import StorageService from '../utils/storage';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

interface PasswordResetRequestData {
  email: string;
}

interface PasswordResetConfirmData {
  uid: string;
  token: string;
  new_password: string;
}
export const AuthService = {
  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      if (__DEV__) {
        console.log('Login attempt:', {
          email: data.email,
          endpoint: API_ENDPOINTS.LOGIN,
          url: `${BASE_URL}${API_ENDPOINTS.LOGIN}`,
        });
      }
      
      const response = await ApiService.post<AuthResponse>(
        '/auth/jwt_login/',
        {
          email: data.email,
          password: data.password
        }
      );
      
      console.log('✅ Login successful - Full Response:', response);
      console.log('Access Token:', response.access ? 'PRESENT' : '❌ MISSING');
      console.log('User:', response.user);
      
      if (response.access) {
        console.log('💾 Saving token to storage...');
        console.log('Token to save:', response.access.substring(0, 50) + '...');
        
        await StorageService.setAuthToken(response.access);
        console.log('✅ Token saved');
        
        // Immediate verification
        const savedToken = await StorageService.getAuthToken();
        console.log('� Immediate verification - Token retrieved:', savedToken ? savedToken.substring(0, 50) + '...' : 'NULL');
        
        if (!savedToken) {
          console.error('❌ CRITICAL: Token was NOT saved to AsyncStorage!');
          throw new Error('Failed to save authentication token');
        }
        
        console.log('�💾 Saving user data...');
        await StorageService.setUserData(response.user);
        console.log('✅ User data saved');
        
        // Determine role from response
        let role: 'admin' | 'user' | 'player' = 'user';
        if (response.is_staff || (response.user && response.user.is_staff)) {
          role = 'admin';
        } else if (response.user_type === 'player') {
          role = 'player';
        }
        
        console.log('💾 Saving user role:', role);
        await StorageService.setUserRole(role);
        console.log('✅ User role saved');
        
        // Final verification
        const finalToken = await StorageService.getAuthToken();
        const finalUser = await StorageService.getUserData();
        const finalRole = await StorageService.getUserRole();
        console.log('🔍 Final Verification:');
        console.log('  - Token:', finalToken ? 'YES ✅' : 'NO ❌');
        console.log('  - User:', finalUser ? 'YES ✅' : 'NO ❌');
        console.log('  - Role:', finalRole || 'NONE');
      } else {
        console.error('❌ NO ACCESS TOKEN IN RESPONSE!');
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
        '/auth/jwt_register/',
        data,
      );
      
      console.log('Registration success:', {...response, token: '[REDACTED]'});
      
      if (response.access) {
        await StorageService.setAuthToken(response.access);
        await StorageService.setUserData(response.user);
        // Determine role from response
        let role: 'admin' | 'user' | 'player' = 'user';
        if (response.is_staff || (response.user && response.user.is_staff)) {
          role = 'admin';
        } else if (response.user_type === 'player') {
          role = 'player';
        }
        await StorageService.setUserRole(role);
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

  /**
   * Change password for authenticated user
   */
  async changePassword(data: ChangePasswordData): Promise<{message: string}> {
    try {
      const response = await ApiService.post<{message: string}>(
        '/auth/change-password/',
        data
      );
      return response;
    } catch (error: any) {
      console.error('Change password error:', error.response?.data);
      throw error;
    }
  },

  /**
   * Request password reset (send email with reset link)
   */
  async requestPasswordReset(data: PasswordResetRequestData): Promise<{message: string}> {
    try {
      const response = await ApiService.post<{message: string}>(
        '/auth/password-reset/',
        data
      );
      return response;
    } catch (error: any) {
      console.error('Password reset request error:', error.response?.data);
      throw error;
    }
  },

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<{message: string}> {
    try {
      const response = await ApiService.post<{message: string}>(
        '/auth/password-reset-confirm/',
        data
      );
      return response;
    } catch (error: any) {
      console.error('Password reset confirm error:', error.response?.data);
      throw error;
    }
  },
};

export default AuthService;
