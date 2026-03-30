import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';

/**
 * Factory interface for creating S3 clients with runtime credentials
 */
export interface S3ClientFactory {
  /**
   * Create an S3 client configured with the provided credentials
   * @param credentials - Upload credentials containing access keys and region
   * @returns Configured S3 client instance
   */
  createS3Client(credentials: UiUploadCredentials): any;
}
