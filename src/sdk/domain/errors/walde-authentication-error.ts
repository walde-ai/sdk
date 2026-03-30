import { WaldeUserError } from './walde-user-error';

/**
 * Represents authentication errors in the Walde SDK.
 * 
 * Thrown when authentication-related operations fail due to:
 * - No valid credentials available
 * - No refresh token available
 * - Credentials file not found
 * 
 * This indicates the user needs to authenticate or re-authenticate
 * with the system before proceeding.
 * 
 * @example
 * ```typescript
 * throw new WaldeAuthenticationError('No valid credentials available', { credentialsPath: '~/.walde/credentials.json' });
 * ```
 */
export class WaldeAuthenticationError extends WaldeUserError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
