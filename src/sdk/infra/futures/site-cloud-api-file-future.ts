import type { WaldeAdmin } from '@/sdk/infra/futures/walde-admin-future';
import { Future, Result, ok } from '@/std';
import { SiteCloudApiPushFuture } from './site-cloud-api-push-future';

export interface SiteCloudApiFileFutureParams {
  parent: WaldeAdmin;
  siteId: string;
  filePath: string;
}

export class SiteCloudApiFileFuture extends Future<SiteCloudApiFileFuture, WaldeAdmin> {
  private readonly siteId: string;
  private readonly filePath: string;

  constructor(params: SiteCloudApiFileFutureParams) {
    super({ parent: params.parent });
    this.siteId = params.siteId;
    this.filePath = params.filePath;
  }

  push(): SiteCloudApiPushFuture {
    return new SiteCloudApiPushFuture({
      parent: this.parent,
      siteId: this.siteId,
      filePaths: [this.filePath],
    });
  }

  async resolve(): Promise<Result<SiteCloudApiFileFuture, never>> {
    return ok(this);
  }
}
