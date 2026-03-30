import { readFile, writeFile } from 'fs/promises';
import matter from 'gray-matter';
import { ContentFileWriter } from '@/sdk/domain/ports/out/content-file-writer';
import { WaldeLocalError } from '@/sdk/domain/errors';

/**
 * File system implementation for updating content files with returned IDs
 */
export class FileContentWriter implements ContentFileWriter {
  /**
   * Updates a content file with the content ID while preserving formatting
   * @param filePath - Path to the content file
   * @param contentId - The content ID to add to frontmatter
   */
  public async updateContentFile(filePath: string, contentId: string): Promise<void> {
    try {
      const fileContent = await readFile(filePath, 'utf-8');
      const parsed = matter(fileContent);
      
      // Create new frontmatter with ID as first key if it doesn't exist
      let newFrontmatter: Record<string, any>;
      
      if (parsed.data.id) {
        // ID already exists, just update it
        newFrontmatter = { ...parsed.data, id: contentId };
      } else {
        // ID doesn't exist, make it the first key
        newFrontmatter = { id: contentId, ...parsed.data };
      }
      
      // Reconstruct file with updated frontmatter
      const updatedContent = matter.stringify(parsed.content, newFrontmatter);
      
      await writeFile(filePath, updatedContent, 'utf-8');
    } catch (error) {
      throw new WaldeLocalError('Failed to update content file', error as Error, { filePath });
    }
  }
}
