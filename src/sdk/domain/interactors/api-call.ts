import { BackendCommunication } from '@/sdk/domain/ports/out/backend-communication';
import { WaldeUsageError } from '@/sdk/domain/errors';

export interface ApiCallParams {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  headers?: Record<string, string>;
}

/**
 * Interactor for making authenticated API calls
 */
export class ApiCall {
  constructor(private readonly backendCommunication: BackendCommunication) {}

  /**
   * Execute authenticated API call
   */
  public async execute(params: ApiCallParams): Promise<any> {
    const { method, endpoint, data, headers } = params;
    
    // Ensure endpoint starts with /
    const apiPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    switch (method) {
      case 'GET':
        return await this.backendCommunication.get(apiPath, headers);
      case 'POST':
        return await this.backendCommunication.post(apiPath, data, headers);
      case 'PUT':
        return await this.backendCommunication.put(apiPath, data, headers);
      case 'DELETE':
        return await this.backendCommunication.delete(apiPath, headers);
      default:
        throw new WaldeUsageError('Unsupported HTTP method', { method });
    }
  }
}
