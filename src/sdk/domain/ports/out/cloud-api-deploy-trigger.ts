import { CloudApiDeployResult } from '@/sdk/domain/entities/cloud-api-deploy-result';

export interface TriggerCloudApiDeployInput {
  siteId: string;
  manifestEtag: string;
}

export interface ICloudApiDeployTrigger {
  trigger(input: TriggerCloudApiDeployInput): Promise<CloudApiDeployResult>;
}
