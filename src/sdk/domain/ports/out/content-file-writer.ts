/**
 * Interface for updating content files with returned IDs
 */
export interface ContentFileWriter {
  /**
   * Updates a content file with the content ID while preserving formatting
   * @param filePath - Path to the content file
   * @param contentId - The content ID to add to frontmatter
   */
  updateContentFile(filePath: string, contentId: string): Promise<void>;
}
