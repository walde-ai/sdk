import { BriefRepository } from '@/sdk/domain/ports/out/brief-repository';
import { Brief, BriefEvent, BriefEnvelope } from '@/sdk/domain/entities/brief';
import { ApiClient } from '@/sdk/infra/adapters/api-client';

interface BriefApiData {
  id: string;
  projectId: string;
  tenantId: string;
  title: string;
  state: string;
  createdAt: string;
  sections: Record<string, string>;
  comments: Array<{
    author: { name: string };
    content: string;
    timestamp: string;
  }>;
}

interface BriefEventApiData {
  id: string;
  briefId: string;
  type: string;
  author: { name: string };
  timestamp: string;
  payload: Record<string, any>;
}

interface BriefEnvelopeApiData {
  id: string;
  projectId: string;
  tenantId: string;
  title: string;
  state: string;
  createdAt: string;
}

export class HttpBriefRepository implements BriefRepository {
  private static readonly BASE_PATH = '/v1/briefs';

  constructor(private readonly apiClient: ApiClient) {}

  async appendEvent(params: {
    briefId?: string;
    projectId?: string;
    type: 'edit' | 'commentAdd';
    author: { name: string };
    payload: Record<string, any>;
  }): Promise<Brief> {
    const body: Record<string, any> = {
      type: params.type,
      author: params.author,
      payload: params.payload,
    };

    if (params.briefId) {
      body.briefId = params.briefId;
    } else {
      if (!params.projectId) {
        throw new Error('projectId is required when creating a Brief');
      }
      body.projectId = params.projectId;
    }

    const data = await this.apiClient.post<BriefApiData>(`${HttpBriefRepository.BASE_PATH}/events`, body);
    return this.mapBriefData(data);
  }

  async getById(id: string): Promise<Brief> {
    const data = await this.apiClient.get<BriefApiData>(`${HttpBriefRepository.BASE_PATH}/${id}`);
    return this.mapBriefData(data);
  }

  async getEvents(id: string): Promise<BriefEvent[]> {
    const events = await this.apiClient.get<BriefEventApiData[]>(`${HttpBriefRepository.BASE_PATH}/${id}/events`);
    return events.map(e => this.mapEventData(e));
  }

  async list(projectId?: string): Promise<BriefEnvelope[]> {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    const envelopes = await this.apiClient.get<BriefEnvelopeApiData[]>(`${HttpBriefRepository.BASE_PATH}${query}`);
    return envelopes.map(e => this.mapEnvelopeData(e));
  }

  private mapBriefData(data: BriefApiData): Brief {
    return new Brief(
      data.id,
      data.projectId,
      data.tenantId,
      data.title,
      data.state as any,
      data.createdAt,
      data.sections,
      data.comments
    );
  }

  private mapEventData(data: BriefEventApiData): BriefEvent {
    return new BriefEvent(
      data.id,
      data.briefId,
      data.type as any,
      data.author,
      data.timestamp,
      data.payload
    );
  }

  private mapEnvelopeData(data: BriefEnvelopeApiData): BriefEnvelope {
    return {
      id: data.id,
      projectId: data.projectId,
      tenantId: data.tenantId,
      title: data.title,
      state: data.state as any,
      createdAt: data.createdAt,
    };
  }
}
