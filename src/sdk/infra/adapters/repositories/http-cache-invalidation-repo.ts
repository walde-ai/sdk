import { CacheInvalidationRepo } from '@/sdk/domain/ports/out/cache-invalidation-repo';
import { ApiClient } from '@/sdk/infra/adapters/api-client';

interface CacheInvalidationResponse {
  invalidationId: string;
}

/**
 * HTTP adapter for cache invalidation operations.
 *
 * POSTs to /v1/sites/{siteId}/cache-invalidation.
 */
export class HttpCacheInvalidationRepo implements CacheInvalidationRepo {
  constructor(
    private readonly apiClient: ApiClient
  ) {}

  /**
   * Create a cache invalidation via the Walde API.
   */
  async invalidate(siteId: string): Promise<string> {
    const response = await this.apiClient.post<CacheInvalidationResponse>(
      `/v1/sites/${siteId}/cache-invalidation`
    );
    return response.invalidationId;
  }
}
