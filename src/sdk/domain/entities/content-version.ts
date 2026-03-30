import { Format } from './format';
import { ContentPart } from './content-part';

/**
 * Represents a version of user-created content with a specific format and parts
 */
export class ContentVersion {
  public readonly locale: string = 'en-us';

  /**
   * Creates a new ContentVersion instance
   */
  constructor(
    public readonly id: string | undefined,
    public readonly contentId: string,
    public readonly name: string,
    public readonly key: string,
    public readonly format: Format,
    private readonly parts: Map<string, ContentPart<any>>
  ) {
    this.parts = new Map(parts);
  }

  /**
   * Gets all content parts
   */
  public getParts(): Map<string, ContentPart<any>> {
    return this.parts;
  }

  /**
   * Creates a new ContentVersion with a different contentId
   */
  public cloneWithNewContentId(newContentId: string): ContentVersion {
    return new ContentVersion(
      this.id,
      newContentId,
      this.name,
      this.key,
      this.format,
      this.parts
    );
  }
}
