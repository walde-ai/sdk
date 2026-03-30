import { WaldeSystemError } from './walde-system-error';

/**
 * Represents local system errors in the Walde SDK.
 * 
 * Thrown when local file system or storage operations fail, such as:
 * - Failed to read or write content files
 * - Failed to read directories
 * - Failed to save or load workspace configuration
 * - Failed to upload files to S3
 * 
 * This indicates a system-level issue with local resources
 * such as file permissions, disk space, or storage access.
 * 
 * @example
 * ```typescript
 * throw new WaldeLocalError('Failed to read content file', originalError, { filePath: '/path/to/file.md', operation: 'read' });
 * ```
 */
export class WaldeLocalError extends WaldeSystemError {
  constructor(message: string, cause: Error, details?: Record<string, unknown>) {
    super(message, cause, details);
  }
}
