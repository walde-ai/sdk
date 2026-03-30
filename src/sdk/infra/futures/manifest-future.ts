import { Future } from '@/std/domain/entities/future';
import { Result, ok, err } from '@/std/domain/entities/result';
import { Manifest } from '@/sdk/domain/entities/manifest';
import { FrontendHttpClient } from '@/sdk/infra/adapters/frontend-http-client';
import { ManifestDtoMapper } from '@/sdk/infra/mappers/dto/manifest-dto-mapper';

/**
 * Future for manifest retrieval and parsing operations
 */
export class ManifestFuture extends Future<Manifest, never> {
  constructor(
    private readonly httpClient: FrontendHttpClient,
    private readonly manifestMapper: ManifestDtoMapper
  ) {
    super({ parent: undefined as never });
  }

  /**
   * Resolve the manifest by fetching from the API
   */
  async resolve(): Promise<Result<Manifest, any>> {
    try {
      const manifestData = await this.httpClient.get<any>('/manifests/index.json');
      const manifest = this.manifestMapper.toDomain(manifestData);
      return ok(manifest);
    } catch (error) {
      return err(error);
    }
  }
}
