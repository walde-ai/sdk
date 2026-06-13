import { Future, Result, ok, err } from '@/std';
import type { WaldeAdmin } from './walde-admin-future';
import { Project, ProjectState } from '@/sdk/domain/entities/project';
import { ProjectRepository } from '@/sdk/domain/ports/out/project-repository';
import { WaldeConfigurationError } from '@/sdk/domain/errors';

const DEFAULT_READY_TIMEOUT_MS = 10 * 60 * 1000;
const INITIAL_POLL_INTERVAL_MS = 500;
const MAX_POLL_INTERVAL_MS = 5000;

type ProjectOperation = 'create' | 'get' | 'ready' | 'stage.add' | 'stage.update' | 'stage.remove';

export class ProjectFuture extends Future<Project, WaldeAdmin> {
  private operation: ProjectOperation | null = null;
  private projectId?: string;
  private readyTimeoutMs: number = DEFAULT_READY_TIMEOUT_MS;
  private createParams?: { name: string; stages: Array<{ name: string; siteId: string }> };
  private stageData?: Record<string, unknown>;

  constructor({ parent, projectsRepo, projectId }: { parent: WaldeAdmin; projectsRepo: ProjectRepository; projectId?: string }) {
    super({ parent });
    this.projectsRepo = projectsRepo;
    this.projectId = projectId;
  }

  private projectsRepo: ProjectRepository;

  setCreateOperation(params: { name: string; stages: Array<{ name: string; siteId: string }> }): void {
    this.operation = 'create';
    this.createParams = params;
  }

  get(): ProjectFuture {
    if (!this.projectId) {
      throw new WaldeConfigurationError('Project ID required for get operation');
    }
    const future = new ProjectFuture({ parent: this.parent, projectsRepo: this.projectsRepo, projectId: this.projectId });
    future.operation = 'get';
    return future;
  }

  ready(params?: { timeoutMs?: number }): ProjectFuture {
    if (!this.projectId) {
      throw new WaldeConfigurationError('Project ID required for ready operation');
    }
    const future = new ProjectFuture({ parent: this.parent, projectsRepo: this.projectsRepo, projectId: this.projectId });
    future.operation = 'ready';
    future.readyTimeoutMs = params?.timeoutMs ?? DEFAULT_READY_TIMEOUT_MS;
    return future;
  }

  get stage(): StageController {
    if (!this.projectId) {
      throw new WaldeConfigurationError('Project ID required for stage operations');
    }
    return new StageController(this.parent, this.projectsRepo, this.projectId);
  }

  async resolve(): Promise<Result<Project, string>> {
    if (!this.operation) {
      return err('No operation specified');
    }

    switch (this.operation) {
      case 'create': {
        if (!this.createParams) {
          return err('Create params required');
        }
        try {
          const project = await this.projectsRepo.create(this.createParams);
          return ok(project);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      case 'get': {
        if (!this.projectId) {
          return err('Project ID required for get operation');
        }
        try {
          const project = await this.projectsRepo.get(this.projectId);
          return ok(project);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      case 'ready': {
        if (!this.projectId) {
          return err('Project ID required for ready operation');
        }
        return await this.pollUntilActive(this.projectId, this.readyTimeoutMs);
      }
      case 'stage.add':
      case 'stage.update':
      case 'stage.remove': {
        if (!this.projectId) {
          return err('Project ID required for stage operation');
        }
        if (!this.stageData) {
          return err('Stage data required for stage operation');
        }
        try {
          const project = await this.projectsRepo.editStage(this.projectId, this.operation, this.stageData);
          return ok(project);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      default:
        return err(`Unknown operation: ${this.operation}`);
    }
  }

  private async pollUntilActive(projectId: string, timeoutMs: number): Promise<Result<Project, string>> {
    const startTime = Date.now();
    let intervalMs = INITIAL_POLL_INTERVAL_MS;

    while (true) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeoutMs) {
        return err('Timed out waiting for project to become ACTIVE');
      }

      try {
        const project = await this.projectsRepo.get(projectId);
        if (project.state === 'ACTIVE') {
          return ok(project);
        }
        if (project.state === 'ERROR') {
          return err('Project provisioning failed with ERROR state');
        }
      } catch (e: unknown) {
        // transient errors during polling are ignored
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
      intervalMs = Math.min(intervalMs * 2, MAX_POLL_INTERVAL_MS);
    }
  }
}

class StageController {
  constructor(
    private readonly parent: WaldeAdmin,
    private readonly projectsRepo: ProjectRepository,
    private readonly projectId: string
  ) {}

  add(params: { name: string; siteId: string }): ProjectFuture {
    const future = new ProjectFuture({ parent: this.parent, projectsRepo: this.projectsRepo, projectId: this.projectId });
    future['operation'] = 'stage.add';
    future['stageData'] = params as unknown as Record<string, unknown>;
    return future;
  }

  update(params: { name: string; newName?: string; newSiteId?: string }): ProjectFuture {
    const future = new ProjectFuture({ parent: this.parent, projectsRepo: this.projectsRepo, projectId: this.projectId });
    future['operation'] = 'stage.update';
    future['stageData'] = params as unknown as Record<string, unknown>;
    return future;
  }

  remove(params: { name: string }): ProjectFuture {
    const future = new ProjectFuture({ parent: this.parent, projectsRepo: this.projectsRepo, projectId: this.projectId });
    future['operation'] = 'stage.remove';
    future['stageData'] = params as unknown as Record<string, unknown>;
    return future;
  }
}
