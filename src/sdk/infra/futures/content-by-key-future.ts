import { Future } from '@/std/domain/entities/future';
import { Result, ok, err } from '@/std/domain/entities/result';
import { FrontendContent } from '@/sdk/domain/entities/frontend-content';
import { FrontendHttpClient } from '@/sdk/infra/adapters/frontend-http-client';
import { FrontendContentDtoMapper } from '@/sdk/infra/mappers/dto/frontend-content-dto-mapper';
import { ManifestFuture } from './manifest-future';
import { WaldeValidationError } from '@/sdk/domain/errors';

/**
 * Future for content item operations that resolves key/name to ID via manifest
 */
export class ContentByKeyFuture extends Future<FrontendContent, never> {
  private selectedLocale?: string;

  constructor(
    private readonly contentKey: string,
    private readonly keyType: 'key' | 'name',
    private readonly manifestFuture: ManifestFuture,
    private readonly httpClient: FrontendHttpClient,
    private readonly contentMapper: FrontendContentDtoMapper
  ) {
    super({ parent: undefined as never });
  }

  /**
   * Specify locale for content retrieval
   */
  locale(locale: string): ContentByKeyFuture {
    const newFuture = new ContentByKeyFuture(
      this.contentKey,
      this.keyType,
      this.manifestFuture,
      this.httpClient,
      this.contentMapper
    );
    newFuture.selectedLocale = locale;
    return newFuture;
  }

  /**
   * Resolve the content by first looking up ID in manifest, then fetching from API
   */
  async resolve(): Promise<Result<FrontendContent, any>> {
    try {
      if (!this.selectedLocale) {
        return err(new WaldeValidationError('Locale must be specified for content retrieval'));
      }

      // Get manifest to resolve key/name to ID
      const manifestResult = await this.manifestFuture.resolve();
      if (manifestResult.isErr()) {
        return err(manifestResult.unwrapErr());
      }

      const manifest = manifestResult.unwrap();
      const contentMetadata = manifest.contents.find(content => 
        this.keyType === 'key' ? content.key === this.contentKey : content.name === this.contentKey
      );

      if (!contentMetadata) {
        return err(new WaldeValidationError(`Content with ${this.keyType} '${this.contentKey}' not found in manifest`));
      }

      // Fetch content using resolved ID
      const endpoint = `/contents/${contentMetadata.id}/${this.selectedLocale}.json`;
      const contentData = await this.httpClient.get<any>(endpoint);
      const content = this.contentMapper.toDomain(contentData);
      return ok(content);
    } catch (error) {
      return err(error);
    }
  }
}
