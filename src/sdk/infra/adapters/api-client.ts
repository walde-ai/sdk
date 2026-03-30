import { AdminHttpClient } from './admin-http-client';
import { BackendCommunication } from '@/sdk/domain/ports/out/backend-communication';

/**
 * Standard backend API response format
 */
interface ApiResponse<T> {
  payload: T;
  metadata: Record<string, any>;
}

/**
 * API client wrapper that handles standard backend response format
 * All backend responses come with payload and metadata objects
 */
export class ApiClient implements BackendCommunication {
  constructor(
    private readonly httpClient: AdminHttpClient
  ) {}

  /**
   * Make a GET request and extract payload from standard response format
   * @param path - API endpoint path
   * @param headers - Optional custom headers
   * @returns Promise resolving to the payload data
   */
  public async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    const response = await this.httpClient.get(path, headers) as ApiResponse<T>;
    return response.payload;
  }

  /**
   * Make a POST request and extract payload from standard response format
   * @param path - API endpoint path
   * @param body - Request body
   * @param headers - Optional custom headers
   * @returns Promise resolving to the payload data
   */
  public async post<T>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const response = await this.httpClient.post(path, body, headers) as ApiResponse<T>;
    return response.payload;
  }

  /**
   * Make a PUT request and extract payload from standard response format
   * @param path - API endpoint path
   * @param body - Request body
   * @param headers - Optional custom headers
   * @returns Promise resolving to the payload data
   */
  public async put<T>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const response = await this.httpClient.put(path, body, headers) as ApiResponse<T>;
    return response.payload;
  }

  /**
   * Make a DELETE request and extract payload from standard response format
   * @param path - API endpoint path
   * @param headers - Optional custom headers
   * @returns Promise resolving to the payload data
   */
  public async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    const response = await this.httpClient.delete(path, headers) as ApiResponse<T>;
    return response.payload;
  }

  /**
   * Make a request and get the full response including metadata
   * @param method - HTTP method
   * @param path - API endpoint path
   * @param body - Request body (optional)
   * @param headers - Optional custom headers
   * @returns Promise resolving to the full API response
   */
  public async requestWithMetadata<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    switch (method) {
      case 'GET':
        return await this.httpClient.get(path, headers) as ApiResponse<T>;
      case 'POST':
        return await this.httpClient.post(path, body, headers) as ApiResponse<T>;
      case 'PUT':
        return await this.httpClient.put(path, body, headers) as ApiResponse<T>;
      case 'DELETE':
        return await this.httpClient.delete(path, headers) as ApiResponse<T>;
    }
  }
}
