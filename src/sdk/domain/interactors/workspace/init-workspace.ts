import { WorkspaceConfigRepo } from '@/sdk/domain/ports/out/workspace-config-repo';
import { WorkspaceConfig } from '@/sdk/domain/entities/workspace-config';
import { Result, ok, err } from '@/std';

export interface InitWorkspaceParams {
  targetPath: string;
  siteId: string;
  stage?: string;
}

/**
 * Use case for initializing a workspace
 */
export class InitWorkspace {
  constructor(
    private readonly workspaceConfigRepo: WorkspaceConfigRepo
  ) {}

  /**
   * Executes workspace initialization
   */
  async execute(params: InitWorkspaceParams): Promise<Result<WorkspaceConfig, string>> {
    try {
      // Create workspace configuration
      const config = new WorkspaceConfig(params.siteId, { content: 'content', ui: 'ui', assets: 'assets' }, params.stage);
      await this.workspaceConfigRepo.save(params.targetPath, config);

      return ok(config);
    } catch (error) {
      return err(error instanceof Error ? error.message : 'Unknown error during workspace initialization');
    }
  }
}
