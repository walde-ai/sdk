import { WorkspaceConfigRepo } from '@/sdk/domain/ports/out/workspace-config-repo';
import { MinimalProjectWorkspaceConfig } from '@/sdk/domain/entities';
import { Result, ok, err } from '@/std';

export interface CreateProjectWorkspaceParams {
  targetPath: string;
  projectId: string;
}

/**
 * Use case for creating a workspace with the minimal walde.json shape
 * (apiVersion + projectId only) used by `walde create project`.
 *
 * The full UI/content configuration is added later by `walde init`.
 */
export class CreateProjectWorkspace {
  constructor(
    private readonly workspaceConfigRepo: WorkspaceConfigRepo
  ) {}

  async execute(params: CreateProjectWorkspaceParams): Promise<Result<MinimalProjectWorkspaceConfig, string>> {
    try {
      const config = new MinimalProjectWorkspaceConfig(params.projectId);
      await this.workspaceConfigRepo.saveMinimal(params.targetPath, config);
      return ok(config);
    } catch (error) {
      return err(error instanceof Error ? error.message : 'Unknown error during workspace creation');
    }
  }
}
