import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { Future, ok, err, some, none } from '@/std';
import type { Result, Option } from '@/std';
import { Content } from '@/sdk/domain/entities/content';
import { PushContent } from '@/sdk/domain/interactors/content/push-content';
import { FileContentReader } from '@/sdk/infra/adapters/filesystem/file-content-reader';
import { FileContentWriter } from '@/sdk/infra/adapters/filesystem/file-content-writer';

export interface ContentIteratorParams {
  parent: any;
  siteId: string;
  folderPath: string;
  onProgress: (current: number, total: number, filePath: string, success: boolean, error?: Error) => void;
}

export interface ContentResult {
  filePath: string;
  content: Content;
}

/**
 * Iterator for batch content uploads
 */
export class ContentIterator extends Future<ContentResult[], ContentIteratorParams> {
  private files: string[] = [];
  private currentIndex = 0;
  private initialized = false;

  constructor(private params: ContentIteratorParams) {
    super({ parent: params });
  }

  /**
   * Initialize file list if not already done
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    this.files = await this.scanFolder(this.params.folderPath);
    this.initialized = true;
  }

  /**
   * Scan folder for markdown files
   */
  private async scanFolder(folderPath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await readdir(folderPath);
      
      for (const entry of entries) {
        const fullPath = join(folderPath, entry);
        const stats = await stat(fullPath);
        
        if (stats.isFile() && extname(entry) === '.md') {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Folder doesn't exist or can't be read
    }
    
    return files;
  }

  /**
   * Process next file
   */
  next(): Future<Option<ContentResult>, ContentIteratorParams> {
    return new (class extends Future<Option<ContentResult>, ContentIteratorParams> {
      constructor(private iterator: ContentIterator) {
        super(iterator.params);
      }

      async resolve(): Promise<Result<Option<ContentResult>, Error>> {
        try {
          await this.iterator.initialize();
          
          if (this.iterator.currentIndex >= this.iterator.files.length) {
            return ok(none());
          }
          
          const filePath = this.iterator.files[this.iterator.currentIndex++];
          const config = this.iterator.params.parent.getConfig();
          const contentFileReader = new FileContentReader();
          const contentFileWriter = new FileContentWriter();
          const pushContent = new PushContent(
            config.contentRepo,
            contentFileReader,
            contentFileWriter
          );
          
          const content = await pushContent.execute(this.iterator.params.siteId, filePath);
          return ok(some({ filePath, content }));
        } catch (error) {
          return err(error as Error);
        }
      }
    })(this);
  }

  /**
   * Process specified number of files
   */
  iter(count: number): ContentIterator {
    const newIterator = new ContentIterator(this.params);
    newIterator.files = this.files;
    newIterator.currentIndex = this.currentIndex;
    newIterator.initialized = this.initialized;
    
    // Update internal state to process 'count' files
    newIterator.currentIndex = Math.min(this.currentIndex + count, this.files.length);
    this.currentIndex = newIterator.currentIndex;
    
    return newIterator;
  }

  /**
   * Process all remaining files
   */
  async resolve(): Promise<Result<ContentResult[], Error>> {
    try {
      await this.initialize();
      
      const results: ContentResult[] = [];
      const config = this.params.parent.getConfig();
      const contentFileReader = new FileContentReader();
      const contentFileWriter = new FileContentWriter();
      const pushContent = new PushContent(
        config.contentRepo,
        contentFileReader,
        contentFileWriter
      );
      
      let current = 0;
      while (this.currentIndex < this.files.length) {
        const filePath = this.files[this.currentIndex++];
        current++;
        
        try {
          const content = await pushContent.execute(this.params.siteId, filePath);
          results.push({ filePath, content });
          this.params.onProgress(current, this.files.length, filePath, true);
        } catch (error) {
          this.params.onProgress(current, this.files.length, filePath, false, error as Error);
          // Continue processing other files even if one fails
        }
      }
      
      return ok(results);
    } catch (error) {
      return err(error as Error);
    }
  }
}
