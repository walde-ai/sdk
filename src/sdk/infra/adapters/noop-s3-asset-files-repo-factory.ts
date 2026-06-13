import { AssetS3FilesRepoFactory } from '@/sdk/domain/interactors/asset/upload-asset-from-folder';
import { RemoteFilesRepo } from '@/sdk/domain/ports/out/remote-files-repo';
import { WaldeUsageError } from '@/sdk/domain/errors';

/**
 * No-op AssetS3FilesRepoFactory for browser contexts where S3 operations are not supported.
 * Throws a WaldeUsageError if create() is called.
 */
export class NoOpS3AssetFilesRepoFactory implements AssetS3FilesRepoFactory {
  public create(_siteId: string): RemoteFilesRepo {
    throw new WaldeUsageError(
      'S3 asset file operations are not supported in browser contexts.',
      { operation: 'createS3AssetFilesRepo' }
    );
  }
}
