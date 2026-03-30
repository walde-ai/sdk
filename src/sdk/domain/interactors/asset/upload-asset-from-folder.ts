import { Result, ok, err } from '@/std';

import { File } from '@/sdk/domain/entities/file';
import { AssetUploadCredentialsRepo } from '@/sdk/domain/ports/out/asset-upload-credentials-repo';
import { RemoteFilesRepo } from '@/sdk/domain/ports/out/remote-files-repo';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';

export interface AssetS3FilesRepoFactory {
  create(siteId: string): RemoteFilesRepo;
}

export class UploadAssetFromFolder {
  constructor(
    private readonly assetUploadCredentialsRepo: AssetUploadCredentialsRepo,
    private readonly s3AssetFilesRepoFactory: AssetS3FilesRepoFactory
  ) {}

  async execute(
    files: File[],
    siteId: string,
    onProgress?: (current: number, total: number, filePath: string, success: boolean, error?: Error) => void
  ): Promise<Result<void, Error>> {
    try {
      if (files.length === 0) { return ok(undefined); }
      const credentials = await this.assetUploadCredentialsRepo.requestCredentials(siteId);
      if (!credentials.isValid()) {
        return err(new WaldeUnexpectedError('Invalid upload credentials received', new Error('Credentials validation failed')));
      }
      const remoteFilesRepo = this.s3AssetFilesRepoFactory.create(siteId);
      if (onProgress) {
        let current = 0;
        for (const file of files) {
          current++;
          try {
            await remoteFilesRepo.uploadFile(file, credentials);
            onProgress(current, files.length, file.path, true);
          } catch (error) {
            onProgress(current, files.length, file.path, false, error as Error);
          }
        }
      } else {
        await remoteFilesRepo.uploadFiles(files, credentials);
      }
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new WaldeUnexpectedError('Unknown error occurred', error as Error));
    }
  }
}
