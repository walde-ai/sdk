import { RemoteFilesRepo } from '@/sdk/domain/ports/out/remote-files-repo';
import { S3ClientFactory } from '@/sdk/domain/ports/out/s3-client-factory';

import { AssetS3FilesRepoFactory } from '@/sdk/domain/interactors/asset/upload-asset-from-folder';
import { AwsS3AssetFilesRepo } from '@/sdk/infra/adapters/repositories/aws-s3-asset-files-repo';

export class DefaultS3AssetFilesRepoFactory implements AssetS3FilesRepoFactory {
  constructor(private readonly s3ClientFactory: S3ClientFactory) {}

  create(siteId: string): RemoteFilesRepo {
    return new AwsS3AssetFilesRepo(this.s3ClientFactory);
  }
}
