import { S3ClientFactory } from '@/sdk/domain/ports/out/s3-client-factory';
import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';
import { S3MockClient } from './s3-mock-client';

/**
 * Factory for creating mock S3 clients that connect to writer-api mock server
 */
export class S3MockClientFactory implements S3ClientFactory {
  constructor(private readonly endpoint: string) {}

  /**
   * Create a mock S3 client configured with the provided credentials
   */
  createS3Client(credentials: UiUploadCredentials): S3MockClient {
    return new S3MockClient(this.endpoint, {
      accessKeyId: credentials.accessKey,
      secretAccessKey: credentials.secretKey,
      sessionToken: credentials.sessionToken
    });
  }
}
