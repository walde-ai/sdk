import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { ContentFileReader } from '@/sdk/domain/ports/in/content-file-reader';
import { WaldeLocalError } from '@/sdk/domain/errors';

/**
 * File system implementation of ContentFileReader
 */
export class FileContentReader implements ContentFileReader {
  /**
   * Reads a markdown file and extracts frontmatter and body content
   * @param filePath - Path to the markdown file
   * @returns Object containing frontmatter metadata and body content
   */
  public async readContentFile(filePath: string): Promise<{
    frontmatter: Record<string, any>;
    body: string;
  }> {
    try {
      const fileContent = await readFile(filePath, 'utf-8');
      const parsed = matter(fileContent);
      
      return {
        frontmatter: parsed.data,
        body: parsed.content
      };
    } catch (error) {
      throw new WaldeLocalError('Failed to read content file', error as Error, { filePath });
    }
  }
}
