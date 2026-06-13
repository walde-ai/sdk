import { S3ClientFactory } from '@/sdk/domain/ports/out/s3-client-factory';
import { UiUploadCredentials } from '@/sdk/domain/entities';
import { WaldeUsageError } from '@/sdk/domain/errors';

/**
 * No-op S3ClientFactory for browser contexts where S3 operations are not supported.
 * Throws a WaldeUsageError if createS3Client() is called.
 */
export class NoOpS3ClientFactory implements S3ClientFactory {
  public createS3Client(_credentials: UiUploadCredentials): never {
    throw new WaldeUsageError(
      'S3 operations are not supported in browser contexts. Use the HTTP API for file operations.',
      { operation: 'createS3Client' }
    );
  }
}
