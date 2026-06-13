import { IAssetEventRepo, AssetEvent } from '@/sdk/domain/ports/out/asset-event-repo';
import { ApiClient } from '@/sdk/infra/adapters/api-client';

export class HttpAssetEventRepo implements IAssetEventRepo {
  constructor(private readonly apiClient: ApiClient) {}

  public async postEvents(siteId: string, events: AssetEvent[]): Promise<void> {
    await this.apiClient.post(`/v1/sites/${siteId}/asset-events`, { events });
  }
}
