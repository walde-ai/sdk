import { FormatPart } from './format-part';

/**
 * Format part that validates key-value pair objects
 */
export class KeyValuePart implements FormatPart {
  public readonly name: string = 'keyvalue';

  /**
   * Validates if the given value is a key-value object with primitive values
   * @param value - The value to validate
   * @returns true if the value is a plain object with string keys and primitive values
   */
  public validate(value: unknown): boolean {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    const obj = value as Record<string, unknown>;
    return Object.entries(obj).every(([key, val]) =>
      typeof key === 'string' && this.isPrimitive(val)
    );
  }

  /**
   * Checks if a value is a primitive type
   * @param value - The value to check
   * @returns true if the value is a primitive (string, number, boolean, null, undefined)
   */
  private isPrimitive(value: unknown): boolean {
    return value === null ||
           value === undefined ||
           typeof value === 'string' ||
           typeof value === 'number' ||
           typeof value === 'boolean';
  }
}
