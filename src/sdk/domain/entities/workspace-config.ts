/**
 * Represents workspace configuration stored in walde.json
 */
export class WorkspaceConfig {
  /**
   * Creates a new WorkspaceConfig instance
   * @param siteId - The site identifier this workspace belongs to
   * @param paths - The paths configuration for content and ui directories
   * @param stage - Optional deployment stage pinned to this workspace
   */
  constructor(
    public readonly siteId: string,
    public readonly paths: { content: string; ui: string; assets: string },
    public readonly stage?: string
  ) {}
}
