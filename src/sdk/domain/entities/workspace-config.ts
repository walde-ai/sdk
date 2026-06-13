/**
 * Represents workspace configuration stored in walde.json (legacy format)
 */
export class WorkspaceConfig {
  constructor(
    public readonly siteId: string,
    public readonly paths: { content: string; ui: string; assets: string },
    public readonly stage?: string
  ) {}
}

/**
 * UI build and deployment configuration for a project workspace
 */
export interface WorkspaceUiConfig {
  buildCommand: string | null;
  workingDirectory: string;
  distFolder: string;
}

/**
 * Content and assets path configuration for a project workspace
 */
export interface WorkspaceContentConfig {
  contentPath: string;
  assetsPath: string;
}

/**
 * Represents project-based workspace configuration stored in walde.json (apiVersion 2026-04-14)
 */
export class ProjectWorkspaceConfig {
  constructor(
    public readonly projectId: string,
    public readonly ui: WorkspaceUiConfig,
    public readonly content: WorkspaceContentConfig
  ) {}
}

/**
 * Minimal project workspace configuration containing only the project identifier.
 *
 * Serialised as a two-field walde.json by `walde create project`. The full
 * `ProjectWorkspaceConfig` (with `ui` and `content` blocks) is added later by
 * `walde init`.
 */
export class MinimalProjectWorkspaceConfig {
  constructor(
    public readonly projectId: string
  ) {}
}
