import { ProjectRepository } from '@/sdk/domain/ports/out/project-repository';
import { Project, ProjectState, ProjectStage } from '@/sdk/domain/entities/project';
import { ApiClient } from '@/sdk/infra/adapters/api-client';

interface ProjectApiData {
  id: string;
  name: string;
  stages: Array<{ name: string; siteId: string }>;
  state: ProjectState;
  repositoryUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectListResponse {
  projects: ProjectApiData[];
}

export class HttpProjectRepository implements ProjectRepository {
  private static readonly BASE_PATH = '/v1/projects';

  constructor(private readonly apiClient: ApiClient) {}

  async create(params: { name: string; stages: Array<{ name: string; siteId: string }> }): Promise<Project> {
    const data = await this.apiClient.post<ProjectApiData>(HttpProjectRepository.BASE_PATH, params);
    return this.mapProjectData(data);
  }

  async getAll(): Promise<Project[]> {
    const response = await this.apiClient.get<ProjectListResponse>(HttpProjectRepository.BASE_PATH);
    return response.projects.map(p => this.mapProjectData(p));
  }

  async get(projectId: string): Promise<Project> {
    const data = await this.apiClient.get<ProjectApiData>(`${HttpProjectRepository.BASE_PATH}/${projectId}`);
    return this.mapProjectData(data);
  }

  async editStage(projectId: string, op: 'stage.add' | 'stage.update' | 'stage.remove', data: Record<string, unknown>): Promise<Project> {
    let apiData = data;
    if (op === 'stage.update' && ('newName' in data || 'newSiteId' in data)) {
      const { name, newName, newSiteId } = data as { name: string; newName?: string; newSiteId?: string };
      apiData = {
        name,
        newStage: {
          name: newName ?? name,
          siteId: newSiteId,
        },
      };
    }
    const result = await this.apiClient.post<ProjectApiData>(`${HttpProjectRepository.BASE_PATH}/${projectId}/edit`, { op, data: apiData });
    return this.mapProjectData(result);
  }

  private mapProjectData(data: ProjectApiData): Project {
    return new Project(
      data.id,
      data.name,
      data.stages ?? [],
      data.state,
      data.repositoryUrl ?? '',
      data.createdAt ?? '',
      data.updatedAt ?? ''
    );
  }
}
