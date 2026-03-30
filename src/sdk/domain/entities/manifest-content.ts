/**
 * Content metadata within manifest
 */
export class ManifestContent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly key: string,
    public readonly format: string,
    public readonly locales: string[]
  ) {}
}
