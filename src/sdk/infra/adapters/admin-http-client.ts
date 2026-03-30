import { TokenProvider } from '../../domain/ports/in/token-provider';
import { WaldeNetworkError, WaldeSystemError, WaldeAuthenticationError, WaldeValidationError, WaldeUnexpectedError } from '@/sdk/domain/errors';
import { CoreHttpRequestHandler } from './http-request-handler';

/**
 * HTTP client for making authenticated admin API requests with read/write operations
 */
export class AdminHttpClient {
  private readonly requestHandler: CoreHttpRequestHandler;

  constructor(
    baseUrl: string,
    private readonly tokenProvider: TokenProvider
  ) {
    this.requestHandler = new CoreHttpRequestHandler(baseUrl);
  }

  async get(path: string, customHeaders?: Record<string, string>): Promise<any> {
    return this.request('GET', path, undefined, customHeaders);
  }

  async post(path: string, body?: any, customHeaders?: Record<string, string>): Promise<any> {
    return this.request('POST', path, body, customHeaders);
  }

  async put(path: string, body?: any, customHeaders?: Record<string, string>): Promise<any> {
    return this.request('PUT', path, body, customHeaders);
  }

  async delete(path: string, customHeaders?: Record<string, string>): Promise<any> {
    return this.request('DELETE', path, undefined, customHeaders);
  }

  private handleHttpError(statusCode: number, statusMessage: string, parsedData: any, url: string): Error {
    const serverMessage = parsedData?.metadata?.error;
    const details = { statusCode, statusMessage, response: parsedData, url };

    if (statusCode === 401) {
      return new WaldeAuthenticationError(
        serverMessage || 'Authentication required. Please login first.',
        details
      );
    }

    if (statusCode === 403) {
      return new WaldeAuthenticationError(
        serverMessage || 'Access denied. You do not have permission to perform this action.',
        details
      );
    }

    if (statusCode >= 500) {
      return new WaldeSystemError(
        serverMessage || `Server error ${statusCode}: ${statusMessage}`,
        undefined,
        details
      );
    }

    if (statusCode >= 400) {
      return new WaldeValidationError(
        serverMessage || `Request failed with status ${statusCode}`,
        details
      );
    }

    return new WaldeNetworkError(`HTTP ${statusCode}: ${statusMessage}`, undefined, details);
  }

  private async request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: any, customHeaders?: Record<string, string>): Promise<any> {
    const accessToken = await this.tokenProvider.getAccessToken();
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      ...customHeaders
    };

    try {
      switch (method) {
        case 'GET':
          return await this.requestHandler.get(path, headers);
        case 'POST':
          return await this.requestHandler.post(path, body, headers);
        case 'PUT':
          return await this.requestHandler.put(path, body, headers);
        case 'DELETE':
          return await this.requestHandler.delete(path, headers);
      }
    } catch (error) {
      if (error instanceof WaldeNetworkError) {
        const details = (error as any).details;
        if (details && typeof details.statusCode === 'number') {
          throw this.handleHttpError(
            details.statusCode,
            details.statusMessage || 'Unknown error',
            details.response || null,
            details.url || path
          );
        }
      }
      throw error;
    }
  }
}
