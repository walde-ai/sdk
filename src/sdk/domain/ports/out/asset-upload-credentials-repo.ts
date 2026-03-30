import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';

export interface AssetUploadCredentialsRepo {
  requestCredentials(siteId: string): Promise<UiUploadCredentials>;
}
