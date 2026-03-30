import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';

/**
 * Repository interface for requesting UI upload credentials
 */
export interface UiUploadCredentialsRepo {
  /**
   * Request temporary upload credentials for a specific site
   */
  requestCredentials(siteId: string): Promise<UiUploadCredentials>;
}
