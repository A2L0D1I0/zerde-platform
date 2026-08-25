import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Attach JWT Bearer Token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('zerde_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle 401 & Common Errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login') && !error.config?.url?.includes('/auth/register')) {
          // Token expired or invalid during active authenticated session
          console.warn('[Zerde API] 401 Unauthorized - clearing credentials');
          localStorage.removeItem('zerde_token');
          // Dispatches a custom auth event for AuthContext to react without page reload
          window.dispatchEvent(new CustomEvent('zerde:unauthorized'));
        }
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T> | T>(url, config);
    return ((response.data as any)?.data !== undefined ? (response.data as any).data : response.data) as T;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T> | T>(url, data, config);
    return ((response.data as any)?.data !== undefined ? (response.data as any).data : response.data) as T;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T> | T>(url, data, config);
    return ((response.data as any)?.data !== undefined ? (response.data as any).data : response.data) as T;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T> | T>(url, data, config);
    return ((response.data as any)?.data !== undefined ? (response.data as any).data : response.data) as T;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T> | T>(url, config);
    return ((response.data as any)?.data !== undefined ? (response.data as any).data : response.data) as T;
  }

  public getRawClient(): AxiosInstance {
    return this.client;
  }
}

export const api = new ApiClient();
export default api;
