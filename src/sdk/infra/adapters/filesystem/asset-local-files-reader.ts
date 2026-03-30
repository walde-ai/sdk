import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

import { File } from '@/sdk/domain/entities/file';
import { FileSystemReader } from '@/sdk/domain/ports/out/file-system-reader';
import { WaldeLocalError } from '@/sdk/domain/errors';

export class AssetLocalFilesReader implements FileSystemReader {
  public async readAllFiles(directoryPath: string): Promise<File[]> {
    const files: File[] = [];
    await this.readDirectoryRecursive(directoryPath, directoryPath, files);
    return files;
  }

  private async readDirectoryRecursive(currentPath: string, basePath: string, files: File[]): Promise<void> {
    try {
      const entries = await readdir(currentPath);
      for (const entry of entries) {
        const fullPath = join(currentPath, entry);
        const stats = await stat(fullPath);
        if (stats.isDirectory()) {
          // Only skip hidden directories; asset folders may include node_modules, dist, build
          if (!entry.startsWith('.')) {
            await this.readDirectoryRecursive(fullPath, basePath, files);
          }
        } else if (stats.isFile()) {
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
