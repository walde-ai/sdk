/**
 * Represents a DNS entry configuration for a site
 */
export class DnsEntry {
  public constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly value: string
  ) {}
}
