import { ContentRepo } from '@/sdk/domain/ports/out/content-repo';
import { Content } from '@/sdk/domain/entities/content';
import { ContentVersion } from '@/sdk/domain/entities/content-version';
import { ContentState } from '@/sdk/domain/entities/content-state';
import { ApiClient } from '@/sdk/infra/adapters/api-client';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';

/**
 * Content API response format
 */
interface ContentApiResponse {
  id: string;
  siteId: string;
  name: string;
  key: string;
  state: string;
  version: {
    id: string;
    contentId: string;
    name: string;
    key: string;
    format: {
      id: string;
      name: string;
    };
    parts: Record<string, { data: any }>;
    apiVersion: string;
  };
}

/**
 * HTTP implementation of ContentRepo using ApiClient for standard response handling
 */
export class HttpContentRepo implements ContentRepo {
  constructor(
    private readonly apiClient: ApiClient
  ) {}

  /**
   * Lists contents for a site
   */
  public async list(siteId: string): Promise<Content[]> {
    return this.getAll(siteId);
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
      const response = await this.apiClient.post<ContentApiResponse>(endpoint, payload);
      
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
   * Gets all contents, optionally filtered by site
   * @param siteId - Optional site identifier to filter by
   * @returns Promise resolving to array of contents
   */
  public async getAll(siteId?: string): Promise<Content[]> {
    try {
      // Backend returns all content regardless of siteId parameter, so just get all
      const response = await this.apiClient.get<ContentApiResponse[]>('/v1/contents');
      
      // Map API response to Content entities
      const allContents = response.map(item => new Content(
        item.id,
        item.siteId,
        item.name,
        item.key,
        item.state as ContentState
      ));
      
      // Client-side filtering by siteId if provided
      if (siteId) {
        return allContents.filter(content => content.siteId === siteId);
      }
      
      // Return all contents if no siteId filter
      return allContents;
    } catch (error) {
      throw new WaldeUnexpectedError('Failed to get contents', error as Error);
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
}
