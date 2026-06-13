import { UiUploadCredentials } from '@/sdk/domain/entities';

export interface AssetUploadCredentialsRepo {
  requestCredentials(siteId: string): Promise<UiUploadCredentials>;
}
