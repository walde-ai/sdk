import { FrontendHttpClient } from '@/sdk/infra/adapters/frontend-http-client';
import { ManifestDtoMapper } from '@/sdk/infra/mappers/dto/manifest-dto-mapper';
import { FrontendContentDtoMapper } from '@/sdk/infra/mappers/dto/frontend-content-dto-mapper';
import { WaldeFuture } from '@/sdk/infra/futures/walde-future';
import { WaldeConfigurationError } from '@/sdk/domain/errors';

const BROWSER_CONTENT_PATH = '/_walde/content';

/**
 * Factory for creating properly configured Walde instances
 */
export class WaldeFactory {
  /**
   * Create a Walde instance with all dependencies
   */
  static create(config?: { url?: string }): WaldeFuture {
    const baseUrl = WaldeFactory.resolveBaseUrl(config?.url);
    const httpClient = new FrontendHttpClient(baseUrl);
    const manifestMapper = new ManifestDtoMapper();
    const contentMapper = new FrontendContentDtoMapper();

    return new WaldeFuture(httpClient, manifestMapper, contentMapper);
  }

  private static resolveBaseUrl(url?: string): string {
    if (url) {
      if (!url.includes(BROWSER_CONTENT_PATH)) {
        const normalized = url.endsWith('/') ? url.slice(0, -1) : url;
        return `${normalized}${BROWSER_CONTENT_PATH}`;
      }
      return url;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${BROWSER_CONTENT_PATH}`;
    }
    throw new WaldeConfigurationError(
      `A URL is required when using MakeWalde outside the browser. Provide a url in the config: MakeWalde({ url: "https://your-site.example.com${BROWSER_CONTENT_PATH}" })`
    );
  }
}
