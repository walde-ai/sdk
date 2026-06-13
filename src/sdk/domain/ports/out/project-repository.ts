import { Project, ProjectStage } from '@/sdk/domain/entities/project';

export interface ProjectRepository {
  create(params: { name: string; stages: Array<{ name: string; siteId: string }> }): Promise<Project>;
  getAll(): Promise<Project[]>;
  get(projectId: string): Promise<Project>;
  editStage(projectId: string, op: 'stage.add' | 'stage.update' | 'stage.remove', data: Record<string, unknown>): Promise<Project>;
}
