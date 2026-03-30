import { Future, ok, err } from '@/std';
import type { Result } from '@/std';
import { Content } from '@/sdk/domain/entities/content';
import { ListContents } from '@/sdk/domain/interactors/content/list-contents';

export interface ContentsParams {
  parent: any;
  siteId: string;
}

/**
 * Future for contents list operations
 */
export class ContentsFuture extends Future<Content[], ContentsParams> {
  constructor(private params: ContentsParams) {
    super({ parent: params });
  }

  /**
   * List all contents
   */
  list(): ContentsFuture {
    return this;
  }

  /**
   * Resolve the contents list operation
   */
  async resolve(): Promise<Result<Content[], Error>> {
    try {
      const config = this.params.parent.getConfig();
      const listContents = new ListContents(config.contentRepo);
      const result = await listContents.execute(this.params.siteId);
      return ok(result);
    } catch (error) {
      return err(error as Error);
    }
  }
}
