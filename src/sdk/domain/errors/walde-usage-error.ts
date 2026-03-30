import { WaldeUserError } from './walde-user-error';

/**
 * Represents usage errors in the Walde SDK.
 * 
 * Thrown when the SDK is used incorrectly, such as:
 * - Unsupported HTTP methods
 * - Attempting to resolve futures that are not directly resolvable
 * - Calling operations without specifying required parameters
 * 
 * This indicates incorrect API usage by the developer and should be
 * resolved by following the correct usage patterns.
 * 
 * @example
 * ```typescript
 * throw new WaldeUsageError('Unsupported HTTP method', { method: 'PATCH', supportedMethods: ['GET', 'POST', 'PUT', 'DELETE'] });
 * ```
 */
export class WaldeUsageError extends WaldeUserError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
