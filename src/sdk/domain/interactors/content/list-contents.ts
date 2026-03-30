import { Content } from '@/sdk/domain/entities/content';
import { ContentRepo } from '@/sdk/domain/ports/out/content-repo';

/**
 * Lists contents for a site
 */
export class ListContents {
  constructor(private readonly contentRepo: ContentRepo) {}

  /**
   * Lists all contents for a site
   * @param siteId - The site identifier
   * @returns Array of contents
   */
  async execute(siteId: string): Promise<Content[]> {
    return await this.contentRepo.list(siteId);
  }
}
