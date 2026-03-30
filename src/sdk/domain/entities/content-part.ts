import { FormatPart } from './format-part';

/**
 * Content part with data and format information
 */
export class ContentPart<T = any> {
  constructor(
    private readonly formatPart: FormatPart,
    public data: T
  ) {}

  /**
   * Gets the format part reference
   */
  public getFormatPart(): FormatPart {
    return this.formatPart;
  }

  /**
   * Gets the data value
   */
  public getData(): T {
    return this.data;
  }

  /**
   * Sets the data value
   */
  public setData(data: T): void {
    this.data = data;
  }

  /**
   * Gets the format name (for backward compatibility)
   */
  public get format(): string {
    return this.formatPart.name;
  }
}
