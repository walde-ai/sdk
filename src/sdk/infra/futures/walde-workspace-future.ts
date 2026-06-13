import { Future, Result, ok, err } from '@/std';
import { ScaffoldProjectWorkspace } from '@/sdk/domain/interactors/workspace/scaffold-project-workspace';
import { ScaffoldApi } from '@/sdk/domain/interactors/workspace/scaffold-api';
import { IScaffoldingRepo } from '@/sdk/domain/ports/out/scaffolding-repo';

export interface ScaffoldProjectParams {
  targetPath: string;
}

export interface ScaffoldApiParams {
  /** PascalCase class name, e.g. "MyApi" */
  name: string;
  /** Absolute path to the project root (contains walde.json) */
  targetPath: string;
}

/**
 * Future for workspace scaffolding operations.
 * Returned by MakeWaldeWorkspace().
 */
export class WaldeWorkspaceFuture extends Future<WaldeWorkspaceFuture, never> {
  private readonly scaffoldProjectWorkspace: ScaffoldProjectWorkspace;
  private readonly scaffoldApiInteractor: ScaffoldApi;

  constructor(scaffoldingRepo: IScaffoldingRepo) {
    super({ parent: undefined as never });
    this.scaffoldProjectWorkspace = new ScaffoldProjectWorkspace(scaffoldingRepo);
    this.scaffoldApiInteractor = new ScaffoldApi(scaffoldingRepo);
  }

  scaffoldProject(params: ScaffoldProjectParams): ScaffoldProjectFuture {
    return new ScaffoldProjectFuture(this.scaffoldProjectWorkspace, params);
  }

  scaffoldApi(params: ScaffoldApiParams): ScaffoldApiFuture {
    return new ScaffoldApiFuture(this.scaffoldApiInteractor, params);
  }

  async resolve(): Promise<Result<WaldeWorkspaceFuture, string>> {
    return ok(this);
  }
}

/**
 * Future for scaffolding the full dev/ project workspace.
 */
export class ScaffoldProjectFuture extends Future<void, never> {
  constructor(
    private readonly interactor: ScaffoldProjectWorkspace,
    private readonly params: ScaffoldProjectParams
  ) {
    super({ parent: undefined as never });
  }

  async resolve(): Promise<Result<void, string>> {
    return this.interactor.execute(this.params);
  }
}

/**
 * Future for scaffolding a new API endpoint.
 */
export class ScaffoldApiFuture extends Future<void, string> {
  constructor(
    private readonly interactor: ScaffoldApi,
    private readonly params: ScaffoldApiParams
  ) {
    super({ parent: undefined as never });
  }

  async resolve(): Promise<Result<void, string>> {
    return this.interactor.execute(this.params);
  }
}
