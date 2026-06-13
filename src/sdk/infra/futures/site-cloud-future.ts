import type { WaldeAdmin } from '@/sdk/infra/futures/walde-admin-future';
import { Future, Result, ok } from '@/std';
import { SiteCloudApiFuture } from './site-cloud-api-future';

export interface SiteCloudFutureParams {
  parent: WaldeAdmin;
  siteId: string;
}

export class SiteCloudFuture extends Future<SiteCloudFuture, WaldeAdmin> {
  private readonly siteId: string;

  constructor(params: SiteCloudFutureParams) {
    super({ parent: params.parent });
    this.siteId = params.siteId;
  }

  api(): SiteCloudApiFuture {
    return new SiteCloudApiFuture({
      parent: this.parent,
      siteId: this.siteId,
    });
  }

  async resolve(): Promise<Result<SiteCloudFuture, never>> {
    return ok(this);
  }
}
