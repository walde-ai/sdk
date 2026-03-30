import { FormatPart } from './format-part';

/**
 * Format part that validates string values
 */
export class StringPart implements FormatPart {
  public readonly name: string = 'string';

  /**
   * Validates if the given value is a string
   * @param value - The value to validate
   * @returns true if the value is a string
   */
  public validate(value: unknown): boolean {
    return typeof value === 'string';
  }
}
