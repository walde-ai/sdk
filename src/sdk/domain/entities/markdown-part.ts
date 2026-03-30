import { FormatPart } from './format-part';

/**
 * Format part that validates markdown content (string values)
 */
export class MarkdownPart implements FormatPart {
  public readonly name: string = 'markdown';

  /**
   * Validates if the given value is valid markdown (string)
   * @param value - The value to validate
   * @returns true if the value is a string (valid markdown)
   */
  public validate(value: unknown): boolean {
    return typeof value === 'string';
  }
}
