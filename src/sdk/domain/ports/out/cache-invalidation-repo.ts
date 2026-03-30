/**
 * Repository for cache invalidation operations.
 */
export interface CacheInvalidationRepo {
  /**
   * Create a cache invalidation for the given site.
   *
   * @param siteId - Site ID
   * @returns The invalidation ID
   */
  invalidate(siteId: string): Promise<string>;
}
