import { Content } from '@/sdk/domain/entities/content';
import { ContentRepo } from '@/sdk/domain/ports/out/content-repo';
import { ContentFileReader } from '@/sdk/domain/ports/in/content-file-reader';
import { ContentFileWriter } from '@/sdk/domain/ports/out/content-file-writer';
import { ParseContentFile } from './parse-content-file';

/**
 * Pushes content from file to API
 */
export class PushContent {
  constructor(
    private readonly contentRepo: ContentRepo,
    private readonly contentFileReader: ContentFileReader,
    private readonly contentFileWriter: ContentFileWriter
  ) {}

  /**
   * Pushes content from file path
   * @param siteId - The site identifier
   * @param filePath - Path to content file
   * @returns The pushed content
   */
  async execute(siteId: string, filePath: string): Promise<Content> {
    const { frontmatter, body } = await this.contentFileReader.readContentFile(filePath);
    
    const parseContentFile = new ParseContentFile();
    const { content, contentVersion } = parseContentFile.execute(frontmatter, body, siteId);

    const result = await this.contentRepo.pushContent(content, contentVersion);
    
    if (!content.id && result.id) {
      await this.contentFileWriter.updateContentFile(filePath, result.id);
    }
    
    return result;
  }
}
