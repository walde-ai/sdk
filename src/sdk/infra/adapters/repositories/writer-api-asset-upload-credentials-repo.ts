import { AssetUploadCredentialsRepo } from '@/sdk/domain/ports/out/asset-upload-credentials-repo';
import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';

import { ApiClient } from '@/sdk/infra/adapters/api-client';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';

interface AssetUploadCredentialsResponse {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
  region: string;
  bucketName: string;
}

export class WriterApiAssetUploadCredentialsRepo implements AssetUploadCredentialsRepo {
  constructor(private readonly apiClient: ApiClient) {}

  public async requestCredentials(siteId: string): Promise<UiUploadCredentials> {
    try {
      const response = await this.apiClient.post<AssetUploadCredentialsResponse>(
        `/v1/sites/${siteId}/request-asset-upload`, {}
      );
      return new UiUploadCredentials(
        response.accessKeyId, response.secretAccessKey, response.sessionToken,
        new Date(response.expiration), response.region, response.bucketName
      );
    } catch (error) {
      throw new WaldeUnexpectedError('Failed to request asset upload credentials', error as Error);
    }
  }
}
