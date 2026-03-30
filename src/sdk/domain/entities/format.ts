import { FormatPart } from './format-part';

/**
 * Represents a format definition with named parts
 */
export class Format {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private readonly parts: Map<string, FormatPart>
  ) {}

  public getName(): string {
    return this.name;
  }

  public getParts(): Map<string, FormatPart> {
    return new Map(this.parts);
  }

  public getPart(key: string): FormatPart | undefined {
    return this.parts.get(key);
  }
}
