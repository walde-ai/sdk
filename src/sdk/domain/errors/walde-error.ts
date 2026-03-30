/**
 * Base error class for the Walde SDK.
 * Used to identify errors that have been processed through the standard error system.
 */
export class WaldeError extends Error {
  public readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.details = details;
  }
}
