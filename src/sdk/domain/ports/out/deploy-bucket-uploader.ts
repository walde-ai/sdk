import { CloudApiBundle } from './bundle-builder';
import { DeployBucketCredentials } from './deploy-bucket-credentials-provider';

export interface DeployManifestFunction {
  name: string;
  hash: string;
  lambdaName: string;
}

export interface DeployManifest {
  apiVersion: '2026-06-06';
  functions: DeployManifestFunction[];
}

export interface UploadDeployArtifactsInput {
  bundles: CloudApiBundle[];
  credentials: DeployBucketCredentials;
}

export interface UploadDeployArtifactsResult {
  manifestEtag: string;
}

export interface IDeployBucketUploader {
  upload(input: UploadDeployArtifactsInput): Promise<UploadDeployArtifactsResult>;
}
