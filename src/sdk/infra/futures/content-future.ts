import { Future, ok, err } from '@/std';
import type { Result } from '@/std';
import { Content } from '@/sdk/domain/entities/content';
import { ListContents } from '@/sdk/domain/interactors/content/list-contents';
import { PushContent } from '@/sdk/domain/interactors/content/push-content';
import { FileContentReader } from '@/sdk/infra/adapters/filesystem/file-content-reader';
import { FileContentWriter } from '@/sdk/infra/adapters/filesystem/file-content-writer';
import { WaldeValidationError } from '@/sdk/domain/errors';

export interface ContentParams {
  parent: any;
  siteId: string;
  contentId?: string;
  contentData?: Partial<Content>;
  filePath?: string;
}

/**
 * Future for content operations
 */
export class ContentFuture extends Future<Content, ContentParams> {
  constructor(private params: ContentParams) {
    super({ parent: params });
  }

  /**
   * Set content properties
   */
  set(data: Partial<Content>): ContentFuture {
    return new ContentFuture({
      ...this.params,
      contentData: { ...this.params.contentData, ...data }
    });
  }

  /**
   * Resolve the content operation
   */
  async resolve(): Promise<Result<Content, Error>> {
    try {
      const config = this.params.parent.getConfig();
      
      if (this.params.filePath) {
        // Push from file - create file adapters
        const contentFileReader = new FileContentReader();
        const contentFileWriter = new FileContentWriter();
        const pushContent = new PushContent(
          config.contentRepo,
          contentFileReader,
          contentFileWriter
        );
        const result = await pushContent.execute(this.params.siteId, this.params.filePath);
        return ok(result);
      } else if (this.params.contentData) {
        // Push content data
        if (!this.params.contentData.name) {
          return err(new WaldeValidationError('Content name is required'));
        }
        if (!this.params.contentData.key) {
          return err(new WaldeValidationError('Content key is required'));
        }
        if (!this.params.contentData.state) {
          return err(new WaldeValidationError('Content state is required'));
        }
        
        const content = new Content(
          this.params.contentId,
          this.params.siteId,
          this.params.contentData.name,
          this.params.contentData.key,
          this.params.contentData.state
        );
        const result = await config.contentRepo.pushContent(content, {} as any);
        return ok(result);
      } else {
        throw new WaldeValidationError('No content data or file path provided');
      }
    } catch (error) {
      return err(error as Error);
    }
  }
}
