import { WorkspaceConfig } from '@/sdk/domain/entities/workspace-config';

/**
 * Interface for workspace configuration persistence
 */
export interface WorkspaceConfigRepo {
  /**
   * Saves workspace configuration to the specified path
   * @param path - Directory path where walde.json should be created
   * @param config - Workspace configuration to save
   */
  save(path: string, config: WorkspaceConfig): Promise<void>;

  /**
   * Loads workspace configuration from the specified path
   * @param path - Directory path where walde.json is located
   * @returns Promise resolving to workspace configuration
   */
  load(path: string): Promise<WorkspaceConfig>;

  /**
   * Searches for workspace configuration starting from the given path and moving up the directory tree
   * @param startPath - Starting directory path (defaults to current working directory)
   * @returns Promise resolving to workspace configuration or null if not found
   */
  findWorkspace(startPath?: string): Promise<WorkspaceConfig | null>;
}
