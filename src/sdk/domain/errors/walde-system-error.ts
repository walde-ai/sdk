import { WaldeError } from './walde-error';

/**
 * Base error class for system-caused errors in the Walde SDK.
 * Represents faults within the app, such as network failures or internal processing errors.
 */
export class WaldeSystemError extends WaldeError {
  public readonly cause: Error | undefined;

  constructor(message: string, cause: Error | undefined, details?: Record<string, unknown>) {
    super(message, details);
    this.cause = cause;
  }
}
