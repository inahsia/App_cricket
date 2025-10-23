import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {BASE_URL} from '../config/api';
import StorageService from '../utils/storage';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (__DEV__) {
      console.log('API Service Configuration:', {
        baseURL: BASE_URL,
        timeout: this.api.defaults.timeout,
        headers: this.api.defaults.headers,
      });
    }

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await StorageService.getAuthToken();
          
          // Enhanced debug logging
          console.log('=== API REQUEST ===');
          console.log('Method:', config.method?.toUpperCase());
          console.log('Base URL:', config.baseURL);
          console.log('Endpoint:', config.url);
          console.log('Full URL:', `${config.baseURL}${config.url}`);
          console.log('Token Retrieved:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
          
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization Header SET:', `Bearer ${token.substring(0, 20)}...`);
          } else {
            console.warn('⚠️ NO TOKEN AVAILABLE - Request will be unauthorized!');
          }
          
          console.log('Final Headers:', config.headers);
          console.log('Data:', config.data);
          console.log('==================');
          
          return config;
        } catch (error) {
          console.error('Request interceptor error:', error);
          return config;
        }
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log('=== API RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        console.log('====================');
        return response;
      },
      async (error) => {
        console.error('=== API ERROR ===');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        console.error('Config:', error.config);
        console.error('=================');
        
        if (error.response?.status === 401) {
          // Token expired or invalid - clear storage
          await StorageService.clearAll();
        } else if (error.response?.status === 403) {
          // Permission denied - keep token, but surface a friendly error
          error.message =
            error.response?.data?.error ||
            error.response?.data?.detail ||
            'You do not have permission to perform this action.';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.log('Making POST request:', {
      url: `${BASE_URL}${url}`,
      data,
      headers: this.api.defaults.headers
    });
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    console.log('POST response:', {
      status: response.status,
      data: response.data
    });
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }
}

export default new ApiService();
