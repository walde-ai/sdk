import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import { File } from '@/sdk/domain/entities/file';
import { FileSystemReader } from '@/sdk/domain/ports/out/file-system-reader';
import { WaldeLocalError } from '@/sdk/domain/errors';

/**
 * Reads files from the local filesystem
 */
export class FileSystemLocalFilesReader implements FileSystemReader {
  /**
   * Recursively reads all files from a directory
   * @param directoryPath - The path to the directory to read
   * @returns Array of File entities with relative paths
   */
  public async readAllFiles(directoryPath: string): Promise<File[]> {
    const files: File[] = [];
    await this.readDirectoryRecursive(directoryPath, directoryPath, files);
    return files;
  }

  /**
   * Recursively reads files from a directory
   * @param currentPath - Current directory being processed
   * @param basePath - Base directory for calculating relative paths
   * @param files - Array to accumulate files
   */
  private async readDirectoryRecursive(
    currentPath: string,
    basePath: string,
    files: File[]
  ): Promise<void> {
    try {
      const entries = await readdir(currentPath);

      for (const entry of entries) {
        const fullPath = join(currentPath, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          // Skip hidden directories and common build/dependency directories
          if (!entry.startsWith('.') && !['node_modules', 'dist', 'build'].includes(entry)) {
            await this.readDirectoryRecursive(fullPath, basePath, files);
          }
        } else if (stats.isFile()) {
          // Skip hidden files
          if (!entry.startsWith('.')) {
            const relativePath = relative(basePath, fullPath);
            const content = await readFile(fullPath);
            files.push(new File(relativePath, content));
          }
        }
      }
    } catch (error) {
      throw new WaldeLocalError('Failed to read directory', error as Error, { currentPath });
    }
  }
}
