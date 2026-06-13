import { WorkspaceConfigRepo } from '@/sdk/domain/ports/out/workspace-config-repo';
import { IScaffoldingRepo } from '@/sdk/domain/ports/out/scaffolding-repo';
import { ScaffoldProjectWorkspace } from '@/sdk/domain/interactors/workspace/scaffold-project-workspace';
import { ProjectWorkspaceConfig } from '@/sdk/domain/entities';
import { Result, ok, err } from '@/std';

export interface InitWorkspaceParams {
  targetPath: string;
  projectId: string;
  ui: {
    buildCommand: string | null;
    workingDirectory: string;
    distFolder: string;
  };
  content: {
    contentPath: string;
    assetsPath: string;
  };
}

/**
 * Use case for initializing a workspace.
 *
 * Persists walde.json and then scaffolds the full `dev/` directory tree via
 * ScaffoldProjectWorkspace.
 */
export class InitWorkspace {
  private readonly scaffoldProjectWorkspace: ScaffoldProjectWorkspace;

  constructor(
    private readonly workspaceConfigRepo: WorkspaceConfigRepo,
    scaffoldingRepo: IScaffoldingRepo
  ) {
    this.scaffoldProjectWorkspace = new ScaffoldProjectWorkspace(scaffoldingRepo);
  }

  async execute(params: InitWorkspaceParams): Promise<Result<ProjectWorkspaceConfig, string>> {
    try {
      const config = new ProjectWorkspaceConfig(
        params.projectId,
        {
          buildCommand: params.ui.buildCommand,
          workingDirectory: params.ui.workingDirectory,
          distFolder: params.ui.distFolder
        },
        {
          contentPath: params.content.contentPath,
          assetsPath: params.content.assetsPath
        }
      );
      await this.workspaceConfigRepo.save(params.targetPath, config);

      const scaffoldResult = await this.scaffoldProjectWorkspace.execute({ targetPath: params.targetPath });
      if (scaffoldResult.isErr()) {
        return err(scaffoldResult.unwrapErr());
      }

      return ok(config);
    } catch (error) {
      return err(error instanceof Error ? error.message : 'Unknown error during workspace initialization');
    }
  }
}
