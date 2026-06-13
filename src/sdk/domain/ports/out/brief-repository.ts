import { Brief, BriefEvent, BriefEnvelope } from '@/sdk/domain/entities/brief';

export interface BriefRepository {
  appendEvent(params: {
    briefId?: string;
    projectId?: string;
    type: 'edit' | 'commentAdd';
    author: { name: string };
    payload: Record<string, any>;
  }): Promise<Brief>;

  getById(id: string): Promise<Brief>;

  getEvents(id: string): Promise<BriefEvent[]>;

  list(projectId?: string): Promise<BriefEnvelope[]>;
}
