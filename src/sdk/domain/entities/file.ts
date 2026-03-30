/**
 * Represents a file with its relative path and content
 */
export class File {
  /**
   * Creates a new File instance
   * @param path - The relative path of the file
   * @param content - The file content as Buffer
   */
  constructor(
    public readonly path: string,
    public readonly content: Buffer
  ) {}
}
