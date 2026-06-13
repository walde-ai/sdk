export type ProjectState = 'PROVISIONING' | 'ACTIVE' | 'ERROR';

export interface ProjectStage {
  name: string;
  siteId: string;
}

export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly stages: ProjectStage[],
    public readonly state: ProjectState,
    public readonly repositoryUrl: string,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}
}
