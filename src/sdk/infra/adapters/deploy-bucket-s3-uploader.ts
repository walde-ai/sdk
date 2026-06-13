import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { IDeployBucketUploader, UploadDeployArtifactsInput, UploadDeployArtifactsResult } from '@/sdk/domain/ports/out/deploy-bucket-uploader';
import { WaldeSystemError } from '@/sdk/domain/errors';

export class DeployBucketS3Uploader implements IDeployBucketUploader {
  async upload(input: UploadDeployArtifactsInput): Promise<UploadDeployArtifactsResult> {
    const client = new S3Client({
      region: input.credentials.region,
      credentials: {
        accessKeyId: input.credentials.accessKeyId,
        secretAccessKey: input.credentials.secretAccessKey,
        sessionToken: input.credentials.sessionToken,
      },
    });

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
}
