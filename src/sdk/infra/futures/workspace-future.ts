import { Future } from '@/std';
import { ProjectWorkspaceConfig, MinimalProjectWorkspaceConfig } from '@/sdk/domain/entities';
import { InitWorkspace, InitWorkspaceParams } from '@/sdk/domain/interactors/workspace/init-workspace';
import { CreateProjectWorkspace, CreateProjectWorkspaceParams } from '@/sdk/domain/interactors/workspace/create-project-workspace';
import { Result } from '@/std';
import { WaldeUsageError } from '@/sdk/domain/errors';

export interface WorkspaceFutureParams {
  parent: Future<any, any>;
  initWorkspace: InitWorkspace;
  createProjectWorkspace: CreateProjectWorkspace;
}

/**
 * Future for workspace operations
 */
export class WorkspaceFuture extends Future<ProjectWorkspaceConfig, WorkspaceFutureParams> {
  private initWorkspace: InitWorkspace;
  private createProjectWorkspace: CreateProjectWorkspace;

  constructor(params: WorkspaceFutureParams) {
    super({ parent: params });
    this.initWorkspace = params.initWorkspace;
    this.createProjectWorkspace = params.createProjectWorkspace;
  }

  init(params: {
    targetPath?: string;
    projectId: string;
    ui: { buildCommand: string | null; workingDirectory: string; distFolder: string };
    content: { contentPath: string; assetsPath: string };
  }): WorkspaceInitFuture {
    return new WorkspaceInitFuture({
      parent: this,
      initWorkspace: this.initWorkspace,
      initParams: {
        targetPath: params.targetPath || process.cwd(),
        projectId: params.projectId,
        ui: params.ui,
        content: params.content
      }
    });
  }

  /**
   * Creates a minimal walde.json (apiVersion + projectId only) at the
   * specified target path. Used by `walde create project`.
   */
  create(params: { targetPath?: string; projectId: string }): WorkspaceCreateFuture {
    return new WorkspaceCreateFuture({
      parent: this,
      createProjectWorkspace: this.createProjectWorkspace,
      createParams: {
        targetPath: params.targetPath || process.cwd(),
        projectId: params.projectId,
      }
    });
  }

  async resolve(): Promise<Result<ProjectWorkspaceConfig, string>> {
    throw new WaldeUsageError('WorkspaceFuture.resolve() called without specific operation. Use init() or create() first.');
  }
}

export interface WorkspaceInitFutureParams {
  parent: Future<any, any>;
  initWorkspace: InitWorkspace;
  initParams: InitWorkspaceParams;
}

/**
 * Future for workspace initialization
 */
export class WorkspaceInitFuture extends Future<ProjectWorkspaceConfig, WorkspaceInitFutureParams> {
  private initWorkspace: InitWorkspace;
  private initParams: InitWorkspaceParams;

  constructor(params: WorkspaceInitFutureParams) {
    super({ parent: params });
    this.initWorkspace = params.initWorkspace;
    this.initParams = params.initParams;
  }

  async resolve(): Promise<Result<ProjectWorkspaceConfig, string>> {
    return await this.initWorkspace.execute(this.initParams);
  }
}

export interface WorkspaceCreateFutureParams {
  parent: Future<any, any>;
  createProjectWorkspace: CreateProjectWorkspace;
  createParams: CreateProjectWorkspaceParams;
}

/**
 * Future for minimal workspace creation by `walde create project`.
 */
export class WorkspaceCreateFuture extends Future<MinimalProjectWorkspaceConfig, WorkspaceCreateFutureParams> {
  private createProjectWorkspace: CreateProjectWorkspace;
  private createParams: CreateProjectWorkspaceParams;

  constructor(params: WorkspaceCreateFutureParams) {
    super({ parent: params });
    this.createProjectWorkspace = params.createProjectWorkspace;
    this.createParams = params.createParams;
  }

  async resolve(): Promise<Result<MinimalProjectWorkspaceConfig, string>> {
    return await this.createProjectWorkspace.execute(this.createParams);
  }
}
