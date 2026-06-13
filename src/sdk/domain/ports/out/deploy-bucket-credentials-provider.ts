export interface DeployBucketCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  bucketName: string;
  region: string;
}

export interface IDeployBucketCredentialsProvider {
  request(siteId: string): Promise<DeployBucketCredentials>;
}
