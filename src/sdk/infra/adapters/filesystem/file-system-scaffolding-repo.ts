import * as fs from 'fs/promises';
import * as path from 'path';

import { IScaffoldingRepo } from '@/sdk/domain/ports/out/scaffolding-repo';

/**
 * Implements IScaffoldingRepo using Node.js `fs/promises`.
 * Node-only — not exported from `src/browser.ts`.
 */
export class FileSystemScaffoldingRepo implements IScaffoldingRepo {
  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
  }

  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf8');
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }
}
