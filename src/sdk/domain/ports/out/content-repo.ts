import { Content } from '@/sdk/domain/entities/content';
import { ContentVersion } from '@/sdk/domain/entities/content-version';

/**
 * Interface for making HTTP requests to content API
 */
export interface ContentRepo {
  /**
   * Lists contents for a site
   * @param siteId - The site identifier
   * @returns Promise resolving to array of contents
   */
  list(siteId: string): Promise<Content[]>;

  /**
   * Pushes content and version to the API
   * @param content - The content entity
   * @param contentVersion - The content version entity
   * @returns Promise resolving to the created/updated content with ID
   */
  pushContent(content: Content, contentVersion: ContentVersion): Promise<Content>;

  /**
   * Gets all contents, optionally filtered by site
   * @param siteId - Optional site identifier to filter by
   * @returns Promise resolving to array of contents
   */
  getAll(siteId?: string): Promise<Content[]>;
}
