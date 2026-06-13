import { ContentRepo } from '@/sdk/domain/ports/out/content-repo';
import { PublishContentParams } from '@/sdk/domain/ports/out/content-repo';
import { Content, ContentVersion, ContentState } from '@/sdk/domain/entities';
import { ApiClient } from '@/sdk/infra/adapters/api-client';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';

/**
 * Content list API response format
 */
interface ContentListApiResponse {
  contents: Array<{
    id: string;
    siteId: string;
    name: string;
    key: string;
    state: string;
  }>;
}

/**
 * Content detail API response format
 */
interface ContentDetailApiResponse {
  id: string;
  siteId: string;
  name: string;
  key: string;
  state: string;
  locale: string;
  availableLocales: string[];
  latestVersion: object | null;
}

/**
 * Content API response format for push
 */
interface ContentPushApiResponse {
  id: string;
  siteId: string;
  name: string;
  key: string;
  state: string;
}

/**
 * HTTP implementation of ContentRepo using ApiClient for standard response handling
 */
export class HttpContentRepo implements ContentRepo {
  constructor(
    private readonly apiClient: ApiClient
  ) {}

  /**
   * Lists contents for a site using the site-scoped endpoint
   */
  public async list(siteId: string): Promise<Content[]> {
    try {
      const response = await this.apiClient.get<ContentListApiResponse>(`/v1/sites/${siteId}/contents`);

      return response.contents.map((item) => new Content(
        item.id,
        item.siteId,
        item.name,
        item.key,
        item.state as ContentState
      ));
    } catch (error) {
      throw new WaldeUnexpectedError('Failed to list contents', error as Error);
    }
  }

  /**
   * Gets a single content item with its version for the given locale
   */
  public async get(contentId: string, locale: string): Promise<{
    id: string;
    siteId: string;
    name: string;
    key: string;
    state: string;
    locale: string;
    availableLocales: string[];
    latestVersion: object | null;
  }> {
    try {
      const response = await this.apiClient.get<ContentDetailApiResponse>(
        `/v1/contents/${contentId}?locale=${encodeURIComponent(locale)}`
      );

      return {
        id: response.id,
        siteId: response.siteId,
        name: response.name,
        key: response.key,
        state: response.state,
        locale: response.locale,
        availableLocales: response.availableLocales,
        latestVersion: response.latestVersion
      };
    } catch (error) {
      throw new WaldeUnexpectedError('Failed to get content', error as Error);
    }
  }

  /**
   * Pushes content and version to the API
   * @param content - The content entity
   * @param contentVersion - The content version entity
   * @returns Promise resolving to the created/updated content with ID
   */
  public async pushContent(content: Content, contentVersion: ContentVersion): Promise<Content> {
    // Transform entities to API format matching specs/body.json
    const payload = {
      ...(content.id && { id: content.id }),
      name: content.name,
      key: content.key,
      state: content.state,
      siteId: content.siteId,
      format: {
        id: contentVersion.format.id
      },
      parts: this.transformParts(contentVersion.getParts())
    };

    try {
      // Use correct endpoint: /v1/contents/<id> for updates, /v1/contents for new content
      const endpoint = content.id ? `/v1/contents/${content.id}` : '/v1/contents';
      
      // ApiClient automatically extracts payload from standard response format
      const response = await this.apiClient.post<ContentPushApiResponse>(endpoint, payload);
      
      // Return updated Content with ID from response payload
      return new Content(
        response.id,
        content.siteId,
        content.name,
        content.key,
        content.state
      );
    } catch (error) {
      // Preserve the original error with response data
      throw error;
    }
  }

  /**
   * Transform ContentParts map to API format
   */
  private transformParts(parts: Map<string, any>): Record<string, { data: any; format: string }> {
    const result: Record<string, { data: any; format: string }> = {};
    
    for (const [key, part] of parts) {
      result[key] = {
        data: part.data,
        format: part.format
      };
    }
    
    return result;
  }

  public async publishContent(params: PublishContentParams): Promise<{ id: string }> {
    const payload = {
      name: params.name,
      key: params.key,
      siteId: params.siteId,
      state: 'PUBLISHED',
      locale: params.locale,
      format: { id: 'native:post:v01' },
      parts: {
        body: { data: params.body, format: 'markdown' },
        metadata: { data: {}, format: 'key-value' },
      },
    };
    const endpoint = params.contentId ? `/v1/contents/${params.contentId}` : '/v1/contents';
    const response = await this.apiClient.post<{ id: string }>(endpoint, payload);
    return { id: response.id };
  }
}
