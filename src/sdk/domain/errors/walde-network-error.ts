import { WaldeSystemError } from './walde-system-error';

/**
 * Represents network-related errors in the Walde SDK.
 * 
 * Thrown when network operations fail, such as:
 * - HTTP error responses from the server
 * - Failed to parse network response data
 * - Network connectivity issues
 * 
 * This indicates a system-level issue with network communication
 * that is typically outside the user's direct control.
 * 
 * @example
 * ```typescript
 * throw new WaldeNetworkError('HTTP error response', originalError, { statusCode: 500, url: '/api/sites' });
 * ```
 */
export class WaldeNetworkError extends WaldeSystemError {
  constructor(message: string, cause: Error | undefined, details?: Record<string, unknown>) {
    super(message, cause, details);
  }
}
