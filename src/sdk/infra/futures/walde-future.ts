import { Future } from '@/std/domain/entities/future';
import { Result, ok, err } from '@/std/domain/entities/result';
import { FrontendHttpClient } from '@/sdk/infra/adapters/frontend-http-client';
import { ManifestDtoMapper } from '@/sdk/infra/mappers/dto/manifest-dto-mapper';
import { FrontendContentDtoMapper } from '@/sdk/infra/mappers/dto/frontend-content-dto-mapper';
import { ManifestFuture } from './manifest-future';
import { FrontendContentsFuture } from './frontend-contents-future';

/**
 * Main Walde future class for frontend SDK operations
 */
export class WaldeFuture extends Future<WaldeFuture, never> {
  constructor(
    private readonly httpClient: FrontendHttpClient,
    private readonly manifestMapper: ManifestDtoMapper,
    private readonly contentMapper: FrontendContentDtoMapper
  ) {
    super({ parent: undefined as never });
  }

  /**
   * Resolve returns self for method chaining
   */
  async resolve(): Promise<Result<WaldeFuture, any>> {
    return ok(this);
  }

  /**
   * Get manifest - resolves to actual manifest data
   */
  manifest(): ManifestFuture {
    return new ManifestFuture(this.httpClient, this.manifestMapper);
  }

  /**
   * Get content operations that require manifest
   */
  contents(): FrontendContentsFuture {
    const manifestFuture = this.manifest();
    return new FrontendContentsFuture(manifestFuture, this.httpClient, this.contentMapper);
  }
}
