import { Future } from '@/std';
import { WorkspaceConfig } from '@/sdk/domain/entities/workspace-config';
import { InitWorkspace, InitWorkspaceParams } from '@/sdk/domain/interactors/workspace/init-workspace';
import { Result } from '@/std';
import { WaldeUsageError } from '@/sdk/domain/errors';

export interface WorkspaceFutureParams {
  parent: Future<any, any>;
  initWorkspace: InitWorkspace;
}

/**
 * Future for workspace operations
 */
export class WorkspaceFuture extends Future<WorkspaceConfig, WorkspaceFutureParams> {
  private initWorkspace: InitWorkspace;

  constructor(params: WorkspaceFutureParams) {
    super({ parent: params });
    this.initWorkspace = params.initWorkspace;
  }

  /**
   * Initialize workspace with configuration
   */
  init(params: { targetPath?: string; siteId: string; stage?: string }): WorkspaceInitFuture {
    return new WorkspaceInitFuture({
      parent: this,
      initWorkspace: this.initWorkspace,
      initParams: {
        targetPath: params.targetPath || process.cwd(),
        siteId: params.siteId,
        stage: params.stage
      }
    });
  }

  async resolve(): Promise<Result<WorkspaceConfig, string>> {
    // This shouldn't be called directly - workspace operations need specific parameters
    throw new WaldeUsageError('WorkspaceFuture.resolve() called without specific operation. Use init() first.');
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
export class WorkspaceInitFuture extends Future<WorkspaceConfig, WorkspaceInitFutureParams> {
  private initWorkspace: InitWorkspace;
  private initParams: InitWorkspaceParams;

  constructor(params: WorkspaceInitFutureParams) {
    super({ parent: params });
    this.initWorkspace = params.initWorkspace;
    this.initParams = params.initParams;
  }

  async resolve(): Promise<Result<WorkspaceConfig, string>> {
    return await this.initWorkspace.execute(this.initParams);
  }
}
