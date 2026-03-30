import { File } from '@/sdk/domain/entities/file';

/**
 * Port for reading files from the filesystem
 */
export interface FileSystemReader {
  /**
   * Recursively reads all files from a directory
   * @param directoryPath - The path to the directory to read
   * @returns Array of File entities with relative paths
   */
  readAllFiles(directoryPath: string): Promise<File[]>;
}
