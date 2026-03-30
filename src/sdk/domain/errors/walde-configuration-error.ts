import { WaldeUserError } from './walde-user-error';

/**
 * Represents configuration errors in the Walde SDK.
 * 
 * Thrown when required configuration is missing or invalid, such as:
 * - Cognito client ID not configured
 * - WorkspaceConfigRepo or BackendCommunication not configured
 * - Site ID required for operations but not provided
 * 
 * This indicates the system is not properly configured and the user
 * needs to provide the required configuration before proceeding.
 * 
 * @example
 * ```typescript
 * throw new WaldeConfigurationError('Site ID required for content operations', { operation: 'content.list' });
 * ```
 */
export class WaldeConfigurationError extends WaldeUserError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
