import { WaldeNetworkError, WaldeUnexpectedError } from '@/sdk/domain/errors';

/**
 * Interface for HTTP request handling
 */
export interface HttpRequestHandler {
  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T>;
  post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T>;
  put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T>;
  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T>;
}

/**
 * HTTP request configuration
 */
export interface HttpRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Core HTTP request handler implementation
 */
export class CoreHttpRequestHandler implements HttpRequestHandler {
  constructor(private readonly baseUrl: string) {}

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>({
      method: 'GET',
      endpoint,
      headers
    });
  }

  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>({
      method: 'POST',
      endpoint,
      body,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>({
      method: 'PUT',
      endpoint,
      body,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>({
      method: 'DELETE',
      endpoint,
      headers
    });
  }

  private async makeRequest<T>(config: HttpRequestConfig): Promise<T> {
    const url = `${this.baseUrl}${config.endpoint}`;

    try {
      const response = await fetch(url, {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      if (!response.ok) {
        let parsedResponse = null;
        try {
          const errorBody = await response.text();
          parsedResponse = errorBody ? JSON.parse(errorBody) : null;
        } catch {
          // Response body is not valid JSON — proceed without it
        }

        throw new WaldeNetworkError(
          `HTTP ${response.status}: ${response.statusText} for ${url}`,
          new Error(`HTTP ${response.status}`),
          {
            statusCode: response.status,
            statusMessage: response.statusText,
            url,
            response: parsedResponse
          }
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.text();
        return data ? JSON.parse(data) : (null as T);
      } else {
        return (await response.text()) as T;
      }
    } catch (error) {
      if (error instanceof WaldeNetworkError) {
        throw error;
      }
      throw new WaldeUnexpectedError('HTTP request failed', error as Error);
    }
  }
}
