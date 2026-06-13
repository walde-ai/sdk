import { WorkspaceConfig, ProjectWorkspaceConfig, MinimalProjectWorkspaceConfig } from '@/sdk/domain/entities';

/**
 * Interface for workspace configuration persistence
 */
export interface WorkspaceConfigRepo {
  /**
   * Saves workspace configuration to the specified path
   * @param path - Directory path where walde.json should be created
   * @param config - Workspace configuration to save
   */
  save(path: string, config: WorkspaceConfig | ProjectWorkspaceConfig): Promise<void>;

  /**
   * Saves a minimal project workspace configuration (projectId only) to the specified path.
   *
   * Used by `walde create project` to write a two-field walde.json before
   * the full UI/content configuration is collected by `walde init`.
   *
   * @param path - Directory path where walde.json should be created
   * @param config - Minimal workspace configuration to save
   */
  saveMinimal(path: string, config: MinimalProjectWorkspaceConfig): Promise<void>;

  /**
   * Loads workspace configuration from the specified path
   * @param path - Directory path where walde.json is located
   * @returns Promise resolving to project workspace configuration
   */
  load(path: string): Promise<ProjectWorkspaceConfig>;

  /**
   * Loads only the projectId from a workspace configuration without validating
   * the presence of `ui` or `content` fields. Tolerates a minimal walde.json
   * written by `walde create project`.
   *
   * @param path - Directory path where walde.json is located
   * @returns Promise resolving to an object containing just the projectId
   */
  loadMinimal(path: string): Promise<{ projectId: string }>;

  /**
   * Searches for workspace configuration starting from the given path and moving up the directory tree
   * @param startPath - Starting directory path (defaults to current working directory)
   * @returns Promise resolving to workspace configuration or null if not found
   */
  findWorkspace(startPath?: string): Promise<ProjectWorkspaceConfig | null>;

  /**
   * Searches for workspace configuration and returns both the config and the directory it was found in
   * @param startPath - Starting directory path (defaults to current working directory)
   * @returns Promise resolving to the workspace config and root path, or null if not found
   */
  findWorkspaceWithRoot(startPath?: string): Promise<{ config: ProjectWorkspaceConfig; rootPath: string } | null>;
}
