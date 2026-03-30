import { WaldeError } from './walde-error';

/**
 * Base error class for user-caused errors in the Walde SDK.
 * Represents incorrect usage of the app, such as missing required parameters or incorrect method usage.
 */
export class WaldeUserError extends WaldeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
