import { S3FilesRepoFactory } from '@/sdk/domain/interactors/ui/upload-ui-from-folder';
import { RemoteFilesRepo } from '@/sdk/domain/ports/out/remote-files-repo';
import { WaldeUsageError } from '@/sdk/domain/errors';

/**
 * No-op S3FilesRepoFactory for browser contexts where S3 operations are not supported.
 * Throws a WaldeUsageError if create() is called.
 */
export class NoOpS3FilesRepoFactory implements S3FilesRepoFactory {
  public create(_siteId: string): RemoteFilesRepo {
    throw new WaldeUsageError(
      'S3 file operations are not supported in browser contexts.',
      { operation: 'createS3FilesRepo' }
    );
  }
}
