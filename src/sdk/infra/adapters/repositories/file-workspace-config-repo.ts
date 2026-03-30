import { WorkspaceConfigRepo } from '@/sdk/domain/ports/out/workspace-config-repo';
import { WorkspaceConfig } from '@/sdk/domain/entities/workspace-config';
import { promises as fs } from 'fs';
import path from 'path';
import { WaldeLocalError } from '@/sdk/domain/errors';

/**
 * File system implementation of WorkspaceConfigRepo
 */
export class FileWorkspaceConfigRepo implements WorkspaceConfigRepo {
  /**
   * Saves workspace configuration to walde.json
   * @param targetPath - Directory path where walde.json should be created
   * @param config - Workspace configuration to save
   */
  public async save(targetPath: string, config: WorkspaceConfig): Promise<void> {
    const configPath = path.join(targetPath, 'walde.json');
    
    const configData: Record<string, unknown> = {
      apiVersion: '2026-03-28' as const,
      siteId: config.siteId,
      paths: config.paths
    };

    if (config.stage) {
      configData.stage = config.stage;
    }
    
    try {
      // Ensure target directory exists
      await fs.mkdir(targetPath, { recursive: true });
      
      await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');
    } catch (error) {
      throw new WaldeLocalError('Failed to save workspace configuration', error as Error, { configPath });
    }
  }

  /**
   * Loads workspace configuration from walde.json
   * @param targetPath - Directory path where walde.json is located
   * @returns Promise resolving to workspace configuration
   */
  public async load(targetPath: string): Promise<WorkspaceConfig> {
    const configPath = path.join(targetPath, 'walde.json');
    
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const configData = JSON.parse(configContent);
      
      // Handle both old and new format for backward compatibility during development
      let paths;
      if (configData.paths) {
        paths = { ...configData.paths, assets: configData.paths.assets ?? 'assets' };
      } else if (configData.contentPath) {
        // Legacy format - convert to new format
        paths = { content: configData.contentPath, ui: 'ui', assets: 'assets' };
      } else {
        // Default paths
        paths = { content: 'content', ui: 'ui', assets: 'assets' };
      }
      
      return new WorkspaceConfig(configData.siteId, paths, configData.stage);
    } catch (error) {
      throw new WaldeLocalError('Failed to load workspace configuration', error as Error);
    }
  }

  /**
   * Searches for workspace configuration starting from the given path and moving up the directory tree
   * @param startPath - Starting directory path (defaults to current working directory)
   * @returns Promise resolving to workspace configuration or null if not found
   */
  public async findWorkspace(startPath: string = process.cwd()): Promise<WorkspaceConfig | null> {
    let currentPath = path.resolve(startPath);
    const root = path.parse(currentPath).root;

    while (currentPath !== root) {
      try {
        const config = await this.load(currentPath);
        return config;
      } catch (error) {
        // Continue searching up the directory tree
        currentPath = path.dirname(currentPath);
      }
    }

    // Check root directory as well
    try {
      const config = await this.load(currentPath);
      return config;
    } catch (error) {
      return null;
    }
  }
}
