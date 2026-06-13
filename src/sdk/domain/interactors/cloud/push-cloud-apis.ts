import { CloudApiDeployResult } from '@/sdk/domain/entities/cloud-api-deploy-result';
import { WaldeError, WaldeUnexpectedError } from '@/sdk/domain/errors';
import { IBundleBuilder } from '@/sdk/domain/ports/out/bundle-builder';
import { IDeployBucketCredentialsProvider } from '@/sdk/domain/ports/out/deploy-bucket-credentials-provider';
import { IDeployBucketUploader } from '@/sdk/domain/ports/out/deploy-bucket-uploader';
import { ICloudApiDeployTrigger } from '@/sdk/domain/ports/out/cloud-api-deploy-trigger';
import { Result, err, ok } from '@/std';

export interface PushCloudApisInput {
  siteId: string;
  filePaths: string[];
}

export class PushCloudApis {
  constructor(
    private readonly bundleBuilder: IBundleBuilder,
    private readonly credentialsProvider: IDeployBucketCredentialsProvider,
    private readonly uploader: IDeployBucketUploader,
    private readonly deployTrigger: ICloudApiDeployTrigger
  ) {}

  async execute(input: PushCloudApisInput): Promise<Result<CloudApiDeployResult, WaldeError>> {
    try {
      const bundles = await this.bundleBuilder.build({
        siteId: input.siteId,
        filePaths: input.filePaths,
      });
      const credentials = await this.credentialsProvider.request(input.siteId);
      const uploaded = await this.uploader.upload({ bundles, credentials });
      const result = await this.deployTrigger.trigger({
        siteId: input.siteId,
        manifestEtag: uploaded.manifestEtag,
      });
      return ok(result);
    } catch (error) {
      if (error instanceof WaldeError) {
        return err(error);
      }
      return err(new WaldeUnexpectedError('Cloud API push failed', error as Error));
    }
  }
}
