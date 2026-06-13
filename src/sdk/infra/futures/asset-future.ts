import { Future, Result, ok, err } from '@/std';

import { AssetUploadCredentialsRepo } from '@/sdk/domain/ports/out/asset-upload-credentials-repo';
import { AssetS3FilesRepoFactory } from '@/sdk/domain/interactors/asset/upload-asset-from-folder';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';
import { File } from '@/sdk/domain/entities';

export interface AssetFutureParams {
  parent: any;
  siteId: string;
  assetKey: string;
  assetUploadCredentialsRepo: AssetUploadCredentialsRepo;
  s3AssetFilesRepoFactory: AssetS3FilesRepoFactory;
  filePath?: string;
}

export class AssetFuture extends Future<void, AssetFutureParams> {
  private params: AssetFutureParams;

  constructor(params: AssetFutureParams) {
    super({ parent: params.parent });
    this.params = params;
  }

  upload(options: { path: string }): AssetFuture {
    return new AssetFuture({ ...this.params, filePath: options.path });
  }

  async resolve(): Promise<Result<void, Error>> {
    try {
      if (!this.params.filePath) {
        return err(new WaldeUnexpectedError('No file path specified for asset upload', new Error('filePath is required')));
      }
      const { readFile } = await import('fs/promises');
      const content = await readFile(this.params.filePath);
      const file = new File(this.params.assetKey, content);
      const credentials = await this.params.assetUploadCredentialsRepo.requestCredentials(this.params.siteId);
      const repo = this.params.s3AssetFilesRepoFactory.create(this.params.siteId);
      await repo.uploadFile(file, credentials);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new WaldeUnexpectedError('Unknown error occurred', error as Error));
    }
  }
}
