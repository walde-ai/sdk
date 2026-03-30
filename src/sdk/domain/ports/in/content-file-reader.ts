/**
 * Interface for reading and parsing content files
 */
export interface ContentFileReader {
  /**
   * Reads a markdown file and extracts frontmatter and body content
   * @param filePath - Path to the markdown file
   * @returns Object containing frontmatter metadata and body content
   */
  readContentFile(filePath: string): Promise<{
    frontmatter: Record<string, any>;
    body: string;
  }>;
}
