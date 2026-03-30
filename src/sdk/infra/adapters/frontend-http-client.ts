import { CoreHttpRequestHandler, HttpRequestHandler } from './http-request-handler';

/**
 * HTTP client for making unauthenticated frontend API requests.
 * Only GET requests are made, so no Content-Type headers are included.
 */
export class FrontendHttpClient implements HttpRequestHandler {
  private readonly requestHandler: CoreHttpRequestHandler;

  constructor(baseUrl: string) {
    this.requestHandler = new CoreHttpRequestHandler(baseUrl);
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.requestHandler.get<T>(endpoint, headers);
  }

  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.requestHandler.post<T>(endpoint, body, headers);
  }

  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.requestHandler.put<T>(endpoint, body, headers);
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.requestHandler.delete<T>(endpoint, headers);
  }
}
