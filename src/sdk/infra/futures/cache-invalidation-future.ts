import { Future, Result } from '@/std';
import { WaldeAdmin } from './walde-admin-future';
import { CacheInvalidationRepo } from '@/sdk/domain/ports/out/cache-invalidation-repo';
import { InvalidateCache } from '@/sdk/domain/interactors/invalidate-cache';

export interface CacheInvalidationResult {
  invalidationId: string;
}

/**
 * Future that executes the cache invalidation when resolved.
 */
export class CacheInvalidationFuture extends Future<CacheInvalidationResult, WaldeAdmin> {
  private readonly siteId: string;
  private readonly cacheInvalidationRepo: CacheInvalidationRepo;

  constructor(params: {
    parent: WaldeAdmin;
    siteId: string;
    cacheInvalidationRepo: CacheInvalidationRepo;
  }) {
    super({ parent: params.parent });
    this.siteId = params.siteId;
    this.cacheInvalidationRepo = params.cacheInvalidationRepo;
  }

  /**
   * Execute the cache invalidation.
   */
  async resolve(): Promise<Result<CacheInvalidationResult, Error>> {
    const interactor = new InvalidateCache(this.cacheInvalidationRepo);
    return interactor.execute({ siteId: this.siteId });
  }
}
