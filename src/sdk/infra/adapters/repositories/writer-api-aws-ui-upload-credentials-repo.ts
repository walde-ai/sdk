import { UiUploadCredentialsRepo } from '@/sdk/domain/ports/out/ui-upload-credentials-repo';
import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';
import { ApiClient } from '@/sdk/infra/adapters/api-client';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';

/**
 * API response structure for UI upload credentials request
 */
interface UiUploadCredentialsResponse {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
  region: string;
  bucketName: string;
}

/**
 * Repository for requesting AWS UI upload credentials from Writer API
 */
export class WriterApiAwsUiUploadCredentialsRepo implements UiUploadCredentialsRepo {
  constructor(private readonly apiClient: ApiClient) {}

  /**
   * Request temporary AWS credentials for UI upload from Writer API
   */
  public async requestCredentials(siteId: string): Promise<UiUploadCredentials> {
    try {
      const response = await this.apiClient.post<UiUploadCredentialsResponse>(
        `/v1/sites/${siteId}/request-ui-upload`,
        {}
      );
      
      // Map AWS temporary credentials response to domain entity
      return new UiUploadCredentials(
        response.accessKeyId,
        response.secretAccessKey,
        response.sessionToken,
        new Date(response.expiration),
        response.region,
        response.bucketName
      );
    } catch (error) {
      throw new WaldeUnexpectedError('Failed to request UI upload credentials', error as Error);
    }
  }
}
