import { CloudApiDeployResult } from '@/sdk/domain/entities/cloud-api-deploy-result';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';
import { ICloudApiDeployTrigger, TriggerCloudApiDeployInput } from '@/sdk/domain/ports/out/cloud-api-deploy-trigger';
import { BackendCommunication } from '@/sdk/domain/ports/out/backend-communication';

interface TriggerResponse {
  eventId: string;
}

export class WriterApiCloudApiDeployTriggerRepo implements ICloudApiDeployTrigger {
  constructor(private readonly backend: BackendCommunication) {}

  async trigger(input: TriggerCloudApiDeployInput): Promise<CloudApiDeployResult> {
    try {
      await this.backend.post<TriggerResponse>(
        `/v1/sites/${input.siteId}/trigger-cloud-api-deploy`,
        { manifestEtag: input.manifestEtag }
      );

      // Polling is intentionally delegated to backend progress APIs.
      // For now we return an empty delta on successful trigger acceptance.
      return {
        created: [],
        updated: [],
        deleted: [],
      };
    } catch (error) {
      throw new WaldeUnexpectedError('Failed to trigger cloud API deploy', error as Error);
    }
  }
}
