import { access, readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

import { File } from '@/sdk/domain/entities';
import { FileSystemReader } from '@/sdk/domain/ports/out/file-system-reader';
import { WaldeLocalError } from '@/sdk/domain/errors';

export class AssetLocalFilesReader implements FileSystemReader {
  public async readAllFiles(directoryPath: string): Promise<File[]> {
    const files: File[] = [];
    // A missing assets directory is treated as "no assets" rather than an error,
    // mirroring how content reading tolerates an absent folder. This keeps
    // `walde push` from aborting (and skipping cache invalidation) on projects
    // that have no assets folder.
    try {
      await access(directoryPath);
    } catch {
      return files;
    }
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
