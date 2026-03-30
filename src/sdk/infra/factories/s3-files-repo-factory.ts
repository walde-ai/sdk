import { RemoteFilesRepo } from '@/sdk/domain/ports/out/remote-files-repo';
import { S3ClientFactory } from '@/sdk/domain/ports/out/s3-client-factory';
import { S3FilesRepoFactory } from '@/sdk/domain/interactors/ui/upload-ui-from-folder';
import { AwsS3FilesRepo } from '@/sdk/infra/adapters/repositories/aws-s3-files-repo';

/**
 * Factory for creating S3 file repositories
 */
export class DefaultS3FilesRepoFactory implements S3FilesRepoFactory {
  constructor(private readonly s3ClientFactory: S3ClientFactory) {}

  create(siteId: string): RemoteFilesRepo {
    return new AwsS3FilesRepo(this.s3ClientFactory);
  }
}
