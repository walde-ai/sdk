import { FrontendHttpClient } from '@/sdk/infra/adapters/frontend-http-client';
import { FrontendContentDtoMapper } from '@/sdk/infra/mappers/dto/frontend-content-dto-mapper';
import { ManifestFuture } from './manifest-future';
import { ContentItemFuture } from './content-item-future';
import { ContentListFuture } from './content-list-future';
import { ContentByKeyFuture } from './content-by-key-future';

/**
 * Future for frontend content operations that fetches manifest when needed
 */
export class FrontendContentsFuture {
  constructor(
    private readonly manifestFuture: ManifestFuture,
    private readonly httpClient: FrontendHttpClient,
    private readonly contentMapper: FrontendContentDtoMapper
  ) {}

  /**
   * Get list of contents from manifest
   */
  list(): ContentListFuture {
    return new ContentListFuture(this.manifestFuture);
  }

  /**
   * Get content by ID - fetches directly without manifest validation
   */
  id(id: string): ContentItemFuture {
    return new ContentItemFuture(id, this.httpClient, this.contentMapper);
  }

  /**
   * Get content by name - resolves name to ID via manifest first
   */
  name(name: string): ContentByKeyFuture {
    return new ContentByKeyFuture(name, 'name', this.manifestFuture, this.httpClient, this.contentMapper);
  }

  /**
   * Get content by key - resolves key to ID via manifest first
   */
  key(key: string): ContentByKeyFuture {
    return new ContentByKeyFuture(key, 'key', this.manifestFuture, this.httpClient, this.contentMapper);
  }
}
