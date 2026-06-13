import { WaldeUnexpectedError } from '@/sdk/domain/errors';
import { IDeployBucketCredentialsProvider, DeployBucketCredentials } from '@/sdk/domain/ports/out/deploy-bucket-credentials-provider';
import { BackendCommunication } from '@/sdk/domain/ports/out/backend-communication';

interface CloudApiUploadCredentialsResponse {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  bucketName: string;
  region: string;
}

export class WriterApiCloudApiUploadCredentialsRepo implements IDeployBucketCredentialsProvider {
  constructor(private readonly backend: BackendCommunication) {}

  async request(siteId: string): Promise<DeployBucketCredentials> {
    try {
      return await this.backend.post<CloudApiUploadCredentialsResponse>(
        `/v1/sites/${siteId}/request-cloud-api-upload`,
        {}
      );
    } catch (error) {
      throw new WaldeUnexpectedError('Failed to request cloud API deploy upload credentials', error as Error);
    }
  }
}
