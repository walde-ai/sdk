import { WaldeUserError } from './walde-user-error';

/**
 * Represents validation errors in the Walde SDK.
 * 
 * Thrown when required parameters are missing or invalid, such as:
 * - Missing content name, key, format, or state in frontmatter
 * - Missing required parameters in future operations
 * 
 * This indicates incorrect usage by the developer and should be resolved
 * by providing the required parameters or correcting the input data.
 * 
 * @example
 * ```typescript
 * throw new WaldeValidationError('Content name is required in frontmatter', { field: 'name' });
 * ```
 */
export class WaldeValidationError extends WaldeUserError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
