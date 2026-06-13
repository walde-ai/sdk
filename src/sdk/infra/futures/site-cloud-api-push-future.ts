import { CloudApiDeployResult } from '@/sdk/domain/entities/cloud-api-deploy-result';
import { PushCloudApis } from '@/sdk/domain/interactors/cloud/push-cloud-apis';
import { WaldeError } from '@/sdk/domain/errors';
import { BundleBuilder } from '@/sdk/infra/adapters/bundle-builder';
import { DeployBucketS3Uploader } from '@/sdk/infra/adapters/deploy-bucket-s3-uploader';
import { WriterApiCloudApiDeployTriggerRepo } from '@/sdk/infra/adapters/repositories/writer-api-cloud-api-deploy-trigger-repo';
import { WriterApiCloudApiUploadCredentialsRepo } from '@/sdk/infra/adapters/repositories/writer-api-cloud-api-upload-credentials-repo';
import type { WaldeAdmin } from '@/sdk/infra/futures/walde-admin-future';
import { Future, Result } from '@/std';

export interface SiteCloudApiPushFutureParams {
  parent: WaldeAdmin;
  siteId: string;
  filePaths: string[];
  filePathsProvider?: () => Promise<string[]>;
}

export class SiteCloudApiPushFuture extends Future<CloudApiDeployResult, WaldeAdmin> {
  private readonly siteId: string;
  private readonly filePaths: string[];
  private readonly filePathsProvider?: () => Promise<string[]>;

  constructor(params: SiteCloudApiPushFutureParams) {
    super({ parent: params.parent });
    this.siteId = params.siteId;
    this.filePaths = params.filePaths;
    this.filePathsProvider = params.filePathsProvider;
  }

  async resolve(): Promise<Result<CloudApiDeployResult, WaldeError>> {
    const filePaths = this.filePathsProvider ? await this.filePathsProvider() : this.filePaths;
    const backend = this.parent.getConfig().backendCommunication;
    const interactor = new PushCloudApis(
      new BundleBuilder(),
      new WriterApiCloudApiUploadCredentialsRepo(backend),
      new DeployBucketS3Uploader(),
      new WriterApiCloudApiDeployTriggerRepo(backend)
    );
    return await interactor.execute({
      siteId: this.siteId,
      filePaths,
    });
  }
}
