import { Future } from '@/std';
import type { Result } from '@/std';
import { ok, err } from '@/std';
import { File } from '@/sdk/domain/entities';
import { UploadUiFromFolder, S3FilesRepoFactory } from '@/sdk/domain/interactors/ui/upload-ui-from-folder';
import { UiUploadCredentialsRepo } from '@/sdk/domain/ports/out/ui-upload-credentials-repo';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';

export interface UiFutureParams {
  parent: any;
  siteId: string;
  uiUploadCredentialsRepo: UiUploadCredentialsRepo;
  s3FilesRepoFactory: S3FilesRepoFactory;
  uploadPath: string;
  onProgress: (current: number, total: number, filePath: string, success: boolean, error?: Error) => void;
}

/**
 * Future for UI operations with method chaining
 */
export class UiFuture extends Future<void, UiFutureParams> {
  constructor(private params: UiFutureParams) {
    super({ parent: params.parent });
  }

  /**
   * Resolve the UI operation
   * @returns Result of the UI upload operation
   */
  async resolve(): Promise<Result<void, Error>> {
    try {
      const params = this.params;
      const { FileSystemLocalFilesReader } = await import('@/sdk/infra/adapters/filesystem/file-system-local-files-reader');
      const fileSystemReader = new FileSystemLocalFilesReader();
      const files = await fileSystemReader.readAllFiles(params.uploadPath);
      const uploadInteractor = new UploadUiFromFolder(
        params.uiUploadCredentialsRepo,
        params.s3FilesRepoFactory
      );
      return await uploadInteractor.execute(files, params.siteId, params.onProgress);
    } catch (error) {
      return err(error instanceof Error ? error : new WaldeUnexpectedError('Unknown error occurred', error as Error));
    }
  }
}
