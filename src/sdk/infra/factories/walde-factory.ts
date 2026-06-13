import { WaldeConfigurationError } from '@/sdk/domain/errors';
import { FrontendHttpClient } from '../adapters/frontend-http-client';
import { WaldeFuture } from '../futures/walde-future';
import { FrontendContentDtoMapper } from '../mappers/dto/frontend-content-dto-mapper';
import { ManifestDtoMapper } from '../mappers/dto/manifest-dto-mapper';

const BROWSER_CONTENT_PATH = '/_walde/content';

/**
 * Factory for creating properly configured Walde instances
 */
export class WaldeFactory {
  /**
   * Create a Walde instance with all dependencies
   */
  static create(config?: { url?: string }): WaldeFuture {
    const contentBaseUrl = WaldeFactory.resolveContentBaseUrl(config?.url);
    const siteBaseUrl = WaldeFactory.resolveSiteBaseUrl(config?.url);
    const httpClient = new FrontendHttpClient(contentBaseUrl);
    const cloudHttpClient = new FrontendHttpClient(siteBaseUrl);
    const manifestMapper = new ManifestDtoMapper();
    const contentMapper = new FrontendContentDtoMapper();

    return new WaldeFuture(httpClient, cloudHttpClient, manifestMapper, contentMapper);
  }

  private static resolveContentBaseUrl(url?: string): string {
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

  private static resolveSiteBaseUrl(url?: string): string {
    if (url) {
      const normalized = url.endsWith('/') ? url.slice(0, -1) : url;
      if (normalized.endsWith(BROWSER_CONTENT_PATH)) {
        return normalized.slice(0, normalized.length - BROWSER_CONTENT_PATH.length);
      }
      return normalized;
    }
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    throw new WaldeConfigurationError(
      `A URL is required when using MakeWalde outside the browser. Provide a url in the config: MakeWalde({ url: "https://your-site.example.com${BROWSER_CONTENT_PATH}" })`
    );
  }
}
