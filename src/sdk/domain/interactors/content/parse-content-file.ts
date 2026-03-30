import { Content } from '@/sdk/domain/entities/content';
import { ContentVersion } from '@/sdk/domain/entities/content-version';
import { ContentState } from '@/sdk/domain/entities/content-state';
import { Format } from '@/sdk/domain/entities/format';
import { ContentPart } from '@/sdk/domain/entities/content-part';
import { FormatPart } from '@/sdk/domain/entities/format-part';
import { KeyValuePart } from '@/sdk/domain/entities/key-value-part';
import { MarkdownPart } from '@/sdk/domain/entities/markdown-part';
import { WaldeValidationError } from '@/sdk/domain/errors';

/**
 * Interactor for parsing markdown files into Content and ContentVersion entities
 */
export class ParseContentFile {
  /**
   * Parses file content into domain entities
   * @param frontmatter - YAML frontmatter object
   * @param body - Markdown body content
   * @param siteId - Site identifier
   * @returns Object containing Content and ContentVersion entities
   */
  public execute(
    frontmatter: Record<string, any>,
    body: string,
    siteId: string
  ): { content: Content; contentVersion: ContentVersion } {
    // Extract content properties from frontmatter
    const contentId = frontmatter.id;
    
    if (!frontmatter.name) {
      throw new WaldeValidationError('Content name is required in frontmatter', { field: 'name' });
    }
    if (!frontmatter.key) {
      throw new WaldeValidationError('Content key is required in frontmatter', { field: 'key' });
    }
    if (!frontmatter.format) {
      throw new WaldeValidationError('Content format is required in frontmatter', { field: 'format' });
    }
    
    const name = frontmatter.name;
    const key = frontmatter.key;
    const state = frontmatter.state === 'DELETED' ? ContentState.DELETED : ContentState.PUBLISHED;
    const formatId = frontmatter.format;

    // Create Content entity
    const content = new Content(contentId, siteId, name, key, state);

    // Create Format with metadata and body parts
    const formatParts = new Map<string, FormatPart>();
    formatParts.set('metadata', new KeyValuePart());
    formatParts.set('body', new MarkdownPart());

    const format = new Format(formatId, formatId, formatParts);

    // Create ContentParts
    const parts = new Map<string, ContentPart<any>>();

    // Use explicit metadata field if present, otherwise extract non-system fields
    let metadataData: any;
    if (frontmatter.metadata) {
      metadataData = frontmatter.metadata;
    } else {
      // Extract all frontmatter except system fields
      metadataData = { ...frontmatter };
      delete metadataData.id;
      delete metadataData.name;
      delete metadataData.key;
      delete metadataData.state;
      delete metadataData.format;
    }

    parts.set('metadata', new ContentPart(new KeyValuePart(), metadataData));
    parts.set('body', new ContentPart(new MarkdownPart(), body));

    // Create ContentVersion
    const contentVersion = new ContentVersion(
      undefined, // version ID will be assigned by backend
      contentId || '', // contentId can be empty for new content creation
      name,
      key,
      format,
      parts
    );

    return { content, contentVersion };
  }
}
