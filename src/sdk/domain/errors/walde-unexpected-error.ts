import { WaldeSystemError } from './walde-system-error';

/**
 * Represents unexpected system errors in the Walde SDK.
 * 
 * Used for errors that indicate the system is in an unexpected state or
 * when wrapping errors from external libraries that should not occur
 * during normal operation.
 * 
 * @example
 * ```typescript
 * try {
 *   // external operation
 * } catch (error) {
 *   throw new WaldeUnexpectedError('Operation failed unexpectedly', error, { operation: 'parseJSON', input: rawData });
 * }
 * ```
 */
export class WaldeUnexpectedError extends WaldeSystemError {
  constructor(message: string, cause: Error, details?: Record<string, unknown>) {
    super(message, cause, details);
  }
}
