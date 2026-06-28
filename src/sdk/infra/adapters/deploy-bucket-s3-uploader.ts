import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { UiUploadCredentials } from '@/sdk/domain/entities';
import { DeployBucketCredentials } from '@/sdk/domain/ports/out/deploy-bucket-credentials-provider';
import { IDeployBucketUploader, UploadDeployArtifactsInput, UploadDeployArtifactsResult } from '@/sdk/domain/ports/out/deploy-bucket-uploader';
import { S3ClientFactory } from '@/sdk/domain/ports/out/s3-client-factory';
import { WaldeSystemError } from '@/sdk/domain/errors';

export class DeployBucketS3Uploader implements IDeployBucketUploader {
  constructor(
    private readonly s3ClientFactory?: S3ClientFactory
  ) {}

  async upload(input: UploadDeployArtifactsInput): Promise<UploadDeployArtifactsResult> {
    const client = this.createS3Client(input.credentials);

    for (const bundle of input.bundles) {
      const key = `lambdas/${bundle.name}/bundle.js`;
      await client.send(new PutObjectCommand({
        Bucket: input.credentials.bucketName,
        Key: key,
        Body: bundle.bundle,
        ContentType: 'application/javascript',
      }));
    }

    const manifest = {
      apiVersion: '2026-06-06' as const,
      functions: input.bundles.map(bundle => ({
        name: bundle.name,
        hash: bundle.hash,
        lambdaName: bundle.lambdaName,
      })),
    };

    const manifestUpload = await client.send(new PutObjectCommand({
      Bucket: input.credentials.bucketName,
      Key: 'deploy-manifest.json',
      Body: JSON.stringify(manifest, null, 2),
      ContentType: 'application/json',
    }));

    if (!manifestUpload.ETag) {
      throw new WaldeSystemError('Missing ETag after deploy manifest upload', undefined, {
        bucketName: input.credentials.bucketName,
      });
    }

    return { manifestEtag: manifestUpload.ETag };
  }

  private createS3Client(credentials: DeployBucketCredentials): S3Client {
    if (this.s3ClientFactory) {
      const uiUploadCredentials = new UiUploadCredentials(
        credentials.accessKeyId,
        credentials.secretAccessKey,
        credentials.sessionToken,
        new Date(Date.now() + 15 * 60 * 1000),
        credentials.region,
        credentials.bucketName
      );
      return this.s3ClientFactory.createS3Client(uiUploadCredentials) as S3Client;
    }

    return new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });
  }
}
