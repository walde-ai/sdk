import { WaldeConfigurationError } from '@/sdk/domain/errors';
import type { WaldeAdmin } from '@/sdk/infra/futures/walde-admin-future';
import { Future, Result, ok } from '@/std';
import { SiteCloudApiDirectoryFuture } from './site-cloud-api-directory-future';
import { SiteCloudApiFileFuture } from './site-cloud-api-file-future';

export interface SiteCloudApiFutureParams {
  parent: WaldeAdmin;
  siteId: string;
}

export class SiteCloudApiFuture extends Future<SiteCloudApiFuture, WaldeAdmin> {
  private readonly siteId: string;

  constructor(params: SiteCloudApiFutureParams) {
    super({ parent: params.parent });
    this.siteId = params.siteId;
  }

  file(params: { path: string }): SiteCloudApiFileFuture {
    if (!params.path) {
      throw new WaldeConfigurationError('File path is required for cloud api file push');
    }
    return new SiteCloudApiFileFuture({
      parent: this.parent,
      siteId: this.siteId,
      filePath: params.path,
    });
  }

  directory(params: { path: string }): SiteCloudApiDirectoryFuture {
    if (!params.path) {
      throw new WaldeConfigurationError('Directory path is required for cloud api directory push');
    }
    return new SiteCloudApiDirectoryFuture({
      parent: this.parent,
      siteId: this.siteId,
      directoryPath: params.path,
    });
  }

  async resolve(): Promise<Result<SiteCloudApiFuture, never>> {
    return ok(this);
  }
}
