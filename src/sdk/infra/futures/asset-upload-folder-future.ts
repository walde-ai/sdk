import { Future, Result, err } from '@/std';

import { AssetUploadCredentialsRepo } from '@/sdk/domain/ports/out/asset-upload-credentials-repo';
import { AssetS3FilesRepoFactory, UploadAssetFromFolder } from '@/sdk/domain/interactors/asset/upload-asset-from-folder';
import { AssetLocalFilesReader } from '@/sdk/infra/adapters/filesystem/asset-local-files-reader';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';

export interface AssetUploadFolderFutureParams {
  parent: any;
  siteId: string;
  assetUploadCredentialsRepo: AssetUploadCredentialsRepo;
  s3AssetFilesRepoFactory: AssetS3FilesRepoFactory;
  uploadPath: string;
  onProgress: (current: number, total: number, filePath: string, success: boolean, error?: Error) => void;
}

export class AssetUploadFolderFuture extends Future<void, AssetUploadFolderFutureParams> {
  constructor(private params: AssetUploadFolderFutureParams) {
    super({ parent: params.parent });
  }

  async resolve(): Promise<Result<void, Error>> {
    try {
      const params = this.params;
      const fileSystemReader = new AssetLocalFilesReader();
      const files = await fileSystemReader.readAllFiles(params.uploadPath);
      const uploadInteractor = new UploadAssetFromFolder(params.assetUploadCredentialsRepo, params.s3AssetFilesRepoFactory);
      return await uploadInteractor.execute(files, params.siteId, params.onProgress);
    } catch (error) {
      return err(error instanceof Error ? error : new WaldeUnexpectedError('Unknown error occurred', error as Error));
    }
  }
}
