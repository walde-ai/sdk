import { Future, Result, ok, err } from '@/std';
import type { WaldeAdmin } from './walde-admin-future';
import { Project } from '@/sdk/domain/entities/project';
import { ProjectRepository } from '@/sdk/domain/ports/out/project-repository';
import { ProjectFuture } from './project-future';

export class ProjectsFuture extends Future<Project[], WaldeAdmin> {
  private operation: 'list' | null = null;
  private createParams?: { name: string; stages: Array<{ name: string; siteId: string }> };

  constructor({ parent, projectsRepo }: { parent: WaldeAdmin; projectsRepo: ProjectRepository }) {
    super({ parent });
    this.projectsRepo = projectsRepo;
  }

  private projectsRepo: ProjectRepository;

  list(): ProjectsFuture {
    const future = new ProjectsFuture({ parent: this.parent, projectsRepo: this.projectsRepo });
    future.operation = 'list';
    return future;
  }

  create(params: { name: string; stages: Array<{ name: string; siteId: string }> }): ProjectFuture {
    const future = new ProjectFuture({ parent: this.parent, projectsRepo: this.projectsRepo });
    future.setCreateOperation(params);
    return future;
  }

  async resolve(): Promise<Result<Project[], string>> {
    if (!this.operation) {
      return err('No operation specified');
    }

    switch (this.operation) {
      case 'list': {
        try {
          const projects = await this.projectsRepo.getAll();
          return ok(projects);
        } catch (e: unknown) {
          return err(e instanceof Error ? e.message : String(e));
        }
      }
      default:
        return err(`Unknown operation: ${this.operation}`);
    }
  }
}
