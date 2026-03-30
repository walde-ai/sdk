import { PutObjectCommand } from '@aws-sdk/client-s3';

import { RemoteFilesRepo } from '@/sdk/domain/ports/out/remote-files-repo';
import { S3ClientFactory } from '@/sdk/domain/ports/out/s3-client-factory';
import { File } from '@/sdk/domain/entities/file';
import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';
import { WaldeLocalError } from '@/sdk/domain/errors';

export class AwsS3AssetFilesRepo implements RemoteFilesRepo {
  constructor(private readonly s3ClientFactory: S3ClientFactory) {}

  public async uploadFiles(files: File[], credentials: UiUploadCredentials): Promise<void> {
    for (const file of files) {
      await this.uploadFile(file, credentials);
    }
  }

  public async uploadFile(file: File, credentials: UiUploadCredentials): Promise<void> {
    const s3Client = this.s3ClientFactory.createS3Client(credentials);

    const command = new PutObjectCommand({
      Bucket: credentials.bucketName,
      Key: `assets/${file.path}`,
      Body: file.content,
      ContentType: this.getContentType(file.path)
    });

    try {
      await s3Client.send(command);
    } catch (error) {
      throw new WaldeLocalError('Failed to upload asset to S3', error as Error, { filePath: file.path });
    }
  }

  private getContentType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'html':
        return 'text/html';
      case 'css':
        return 'text/css';
      case 'js':
        return 'application/javascript';
      case 'json':
        return 'application/json';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      case 'ico':
        return 'image/x-icon';
      case 'webp':
        return 'image/webp';
      case 'pdf':
        return 'application/pdf';
      case 'txt':
        return 'text/plain';
      case 'xml':
        return 'application/xml';
      case 'woff':
        return 'font/woff';
      case 'woff2':
        return 'font/woff2';
      default:
        return 'application/octet-stream';
    }
  }
}
