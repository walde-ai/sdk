import { ContentFormat } from './content-format';
import { ContentPart } from './content-part';

/**
 * Version-agnostic frontend content representation
 */
export class FrontendContent {
  constructor(
    public readonly name: string,
    public readonly key: string,
    public readonly format: ContentFormat,
    public readonly parts: Record<string, ContentPart>
  ) {}
}
