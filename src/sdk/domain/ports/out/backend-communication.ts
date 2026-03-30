/**
 * Interface for backend communication with support for custom headers
 */
export interface BackendCommunication {
  /**
   * Make a GET request
   */
  get<T>(path: string, headers?: Record<string, string>): Promise<T>;

  /**
   * Make a POST request
   */
  post<T>(path: string, body?: any, headers?: Record<string, string>): Promise<T>;

  /**
   * Make a PUT request
   */
  put<T>(path: string, body?: any, headers?: Record<string, string>): Promise<T>;

  /**
   * Make a DELETE request
   */
  delete<T>(path: string, headers?: Record<string, string>): Promise<T>;
}
