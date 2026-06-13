import { WorkspaceConfigRepo } from '@/sdk/domain/ports/out/workspace-config-repo';
import { WorkspaceConfig, ProjectWorkspaceConfig, MinimalProjectWorkspaceConfig } from '@/sdk/domain/entities';
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
  public async save(targetPath: string, config: WorkspaceConfig | ProjectWorkspaceConfig): Promise<void> {
    const configPath = path.join(targetPath, 'walde.json');

    let configData: Record<string, unknown>;

    if (config instanceof ProjectWorkspaceConfig) {
      configData = {
        apiVersion: '2026-04-14' as const,
        projectId: config.projectId,
        ui: {
          buildCommand: config.ui.buildCommand,
          workingDirectory: config.ui.workingDirectory,
          distFolder: config.ui.distFolder
        },
        content: {
          contentPath: config.content.contentPath,
          assetsPath: config.content.assetsPath
        }
      };
    } else {
      configData = {
        apiVersion: '2026-03-28' as const,
        siteId: config.siteId,
        paths: config.paths
      };

      if (config.stage) {
        configData.stage = config.stage;
      }
    }

    try {
      await fs.mkdir(targetPath, { recursive: true });
      await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');
    } catch (error) {
      throw new WaldeLocalError('Failed to save workspace configuration', error as Error, { configPath });
    }
  }

  /**
   * Saves a minimal project workspace configuration (projectId only) to walde.json.
   *
   * @param targetPath - Directory path where walde.json should be created
   * @param config - Minimal workspace configuration to save
   */
  public async saveMinimal(targetPath: string, config: MinimalProjectWorkspaceConfig): Promise<void> {
    const configPath = path.join(targetPath, 'walde.json');
    const configData = {
      apiVersion: '2026-04-14' as const,
      projectId: config.projectId,
    };

    try {
      await fs.mkdir(targetPath, { recursive: true });
      await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');
    } catch (error) {
      throw new WaldeLocalError('Failed to save workspace configuration', error as Error, { configPath });
    }
  }

  /**
   * Loads only the projectId from walde.json without validating ui/content fields.
   *
   * @param targetPath - Directory path where walde.json is located
   * @returns Promise resolving to an object containing the projectId
   */
  public async loadMinimal(targetPath: string): Promise<{ projectId: string }> {
    const configPath = path.join(targetPath, 'walde.json');

    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const configData = JSON.parse(configContent);

      if (!configData.projectId || typeof configData.projectId !== 'string') {
        throw new WaldeLocalError(
          'Invalid walde.json: missing required field "projectId".',
          new Error('Missing projectId in walde.json')
        );
      }

      return { projectId: configData.projectId };
    } catch (error) {
      if (error instanceof WaldeLocalError) {
        throw error;
      }
      throw new WaldeLocalError('Failed to load workspace configuration', error as Error);
    }
  }

  /**
   * Loads workspace configuration from walde.json
   * @param targetPath - Directory path where walde.json is located
   * @returns Promise resolving to workspace configuration
   */
  public async load(targetPath: string): Promise<ProjectWorkspaceConfig> {
    const configPath = path.join(targetPath, 'walde.json');
    
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const configData = JSON.parse(configContent);
      
      if (configData.projectId) {
        if (!configData.ui?.workingDirectory) {
          throw new WaldeLocalError(
            'Invalid walde.json: missing required field "ui.workingDirectory". Re-run "walde init" to regenerate.',
            new Error('Missing ui.workingDirectory in walde.json')
          );
        }
        if (!configData.ui?.distFolder) {
          throw new WaldeLocalError(
            'Invalid walde.json: missing required field "ui.distFolder". Re-run "walde init" to regenerate.',
            new Error('Missing ui.distFolder in walde.json')
          );
        }
        if (!configData.content?.contentPath) {
          throw new WaldeLocalError(
            'Invalid walde.json: missing required field "content.contentPath". Re-run "walde init" to regenerate.',
            new Error('Missing content.contentPath in walde.json')
          );
        }
        if (!configData.content?.assetsPath) {
          throw new WaldeLocalError(
            'Invalid walde.json: missing required field "content.assetsPath". Re-run "walde init" to regenerate.',
            new Error('Missing content.assetsPath in walde.json')
          );
        }

        return new ProjectWorkspaceConfig(
          configData.projectId,
          {
            buildCommand: configData.ui.buildCommand ?? null,
            workingDirectory: configData.ui.workingDirectory,
            distFolder: configData.ui.distFolder
          },
          {
            contentPath: configData.content.contentPath,
            assetsPath: configData.content.assetsPath
          }
        );
      }

      throw new WaldeLocalError(
        'This workspace uses an old configuration format. Delete or rename the existing walde.json, then re-run "walde init" to generate a project-based configuration.',
        new Error('Missing projectId in walde.json')
      );
    } catch (error) {
      if (error instanceof WaldeLocalError) {
        throw error;
      }
      throw new WaldeLocalError('Failed to load workspace configuration', error as Error);
    }
  }

  /**
   * Searches for workspace configuration starting from the given path and moving up the directory tree
   * @param startPath - Starting directory path (defaults to current working directory)
   * @returns Promise resolving to workspace configuration or null if not found
   */
  public async findWorkspace(startPath: string = process.cwd()): Promise<ProjectWorkspaceConfig | null> {
    const result = await this.findWorkspaceInternal(startPath);
    return result ? result.config : null;
  }

  /**
   * Searches for workspace configuration and returns both the config and the directory it was found in
   * @param startPath - Starting directory path (defaults to current working directory)
   * @returns Promise resolving to the workspace config and root path, or null if not found
   */
  public async findWorkspaceWithRoot(startPath: string = process.cwd()): Promise<{ config: ProjectWorkspaceConfig; rootPath: string } | null> {
    return this.findWorkspaceInternal(startPath);
  }

  private async findWorkspaceInternal(startPath: string): Promise<{ config: ProjectWorkspaceConfig; rootPath: string } | null> {
    let currentPath = path.resolve(startPath);
    const root = path.parse(currentPath).root;

    while (true) {
      try {
        const config = await this.load(currentPath);
        return { config, rootPath: currentPath };
      } catch (error) {
        if (!this.isFileNotFoundError(error)) {
          throw error;
        }
        if (currentPath === root) {
          return null;
        }
        currentPath = path.dirname(currentPath);
      }
    }
  }

  private isFileNotFoundError(error: unknown): boolean {
    if (error instanceof WaldeLocalError) {
      const cause = error.cause as NodeJS.ErrnoException | undefined;
      return cause?.code === 'ENOENT';
    }
    return false;
  }
}
