import { Result, ok, err } from '@/std';
import { CacheInvalidationRepo } from '@/sdk/domain/ports/out/cache-invalidation-repo';

export interface InvalidateCacheParams {
  siteId: string;
}

export interface InvalidateCacheResult {
  invalidationId: string;
}

/**
 * Interactor for SDK cache invalidation operations.
 *
 * Delegates to the CacheInvalidationRepo.
 */
export class InvalidateCache {
  constructor(
    private readonly cacheInvalidationRepo: CacheInvalidationRepo
  ) {}

  /**
   * Execute cache invalidation.
   *
   * @param params - Invalidation parameters
   * @returns Result with the invalidation details or an error
   */
  async execute(params: InvalidateCacheParams): Promise<Result<InvalidateCacheResult, Error>> {
    const { siteId } = params;

    try {
      const invalidationId = await this.cacheInvalidationRepo.invalidate(siteId);
      return ok({ invalidationId });
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
