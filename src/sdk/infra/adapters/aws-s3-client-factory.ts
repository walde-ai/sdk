import { S3Client } from '@aws-sdk/client-s3';
import { S3ClientFactory } from '@/sdk/domain/ports/out/s3-client-factory';
import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';

/**
 * AWS implementation of S3ClientFactory that creates real S3Client instances
 */
export class AwsS3ClientFactory implements S3ClientFactory {
  /**
   * Create an AWS S3Client configured with the provided credentials
   */
  createS3Client(credentials: UiUploadCredentials): S3Client {
    return new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKey,
        secretAccessKey: credentials.secretKey,
        sessionToken: credentials.sessionToken
      }
    });
  }
}
