import { Result, ok, err } from '@/std';
import { File } from '@/sdk/domain/entities/file';
import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';
import { UiUploadCredentialsRepo } from '@/sdk/domain/ports/out/ui-upload-credentials-repo';
import { RemoteFilesRepo } from '@/sdk/domain/ports/out/remote-files-repo';
import { WaldeUnexpectedError, WaldeSystemError } from '@/sdk/domain/errors';

export interface S3FilesRepoFactory {
  create(siteId: string): RemoteFilesRepo;
}

/**
 * Interactor for uploading UI files from a folder
 */
export class UploadUiFromFolder {
  constructor(
    private readonly uiUploadCredentialsRepo: UiUploadCredentialsRepo,
    private readonly s3FilesRepoFactory: S3FilesRepoFactory
  ) {}

  /**
   * Upload UI files to remote storage
   * @param files - Array of files to upload
   * @param siteId - Site identifier for requesting upload credentials
   * @param onProgress - Optional callback for progress updates
   * @returns Result with success/error information
   */
  async execute(
    files: File[], 
    siteId: string, 
    onProgress?: (current: number, total: number, filePath: string, success: boolean, error?: Error) => void
  ): Promise<Result<void, Error>> {
    try {
      if (files.length === 0) {
        return ok(undefined);
      }

      // Request upload credentials for the site
      const credentials = await this.uiUploadCredentialsRepo.requestCredentials(siteId);
      
      if (!credentials.isValid()) {
        return err(new WaldeUnexpectedError('Invalid upload credentials received', new Error('Credentials validation failed')));
      }

      // Create S3 repo with correct bucket name for this site
      const remoteFilesRepo = this.s3FilesRepoFactory.create(siteId);

      // Upload files with progress tracking
      if (onProgress) {
        let current = 0;
        for (const file of files) {
          current++;
          try {
            await remoteFilesRepo.uploadFile(file, credentials);
            onProgress(current, files.length, file.path, true);
          } catch (error) {
            onProgress(current, files.length, file.path, false, error as Error);
            // Continue with other files even if one fails
          }
        }
      } else {
        // Upload all files without progress tracking
        await remoteFilesRepo.uploadFiles(files, credentials);
      }
      
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new WaldeUnexpectedError('Unknown error occurred', error as Error));
    }
  }
}
