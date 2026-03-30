import { ContentState } from './content-state';

/**
 * Represents content with multiple versions
 */
export class Content {
  /**
   * Creates a new Content instance
   * @param id - The unique identifier for the content (undefined for new content)
   * @param siteId - The site identifier this content belongs to
   * @param name - The name of the content
   * @param key - The key/slug for the content (path-like identifier)
   * @param state - The current state of the content
   */
  constructor(
    public readonly id: string | undefined,
    public readonly siteId: string,
    public readonly name: string,
    public readonly key: string,
    public readonly state: ContentState
  ) {}
}
