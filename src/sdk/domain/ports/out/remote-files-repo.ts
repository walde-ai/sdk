import { File } from '@/sdk/domain/entities/file';
import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';

/**
 * Port for uploading files to remote storage
 */
export interface RemoteFilesRepo {
  /**
   * Upload files to remote storage using provided credentials
   * @param files - The files to upload
   * @param credentials - Upload credentials for authentication
   */
  uploadFiles(files: File[], credentials: UiUploadCredentials): Promise<void>;

  /**
   * Upload a single file to remote storage using provided credentials
   * @param file - The file to upload
   * @param credentials - Upload credentials for authentication
   */
  uploadFile(file: File, credentials: UiUploadCredentials): Promise<void>;
}
