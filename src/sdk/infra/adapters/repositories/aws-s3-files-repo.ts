import { PutObjectCommand } from '@aws-sdk/client-s3';
import { RemoteFilesRepo } from '@/sdk/domain/ports/out/remote-files-repo';
import { S3ClientFactory } from '@/sdk/domain/ports/out/s3-client-factory';
import { File } from '@/sdk/domain/entities/file';
import { UiUploadCredentials } from '@/sdk/domain/entities/ui-upload-credentials';
import { WaldeLocalError } from '@/sdk/domain/errors';

/**
 * AWS S3 implementation for uploading UI files
 */
export class AwsS3FilesRepo implements RemoteFilesRepo {
  constructor(private readonly s3ClientFactory: S3ClientFactory) {}

  /**
   * Upload files to AWS S3 using temporary credentials
   */
  public async uploadFiles(files: File[], credentials: UiUploadCredentials): Promise<void> {
    // Upload all files - errors will be thrown and handled by the interactor
    for (const file of files) {
      await this.uploadFile(file, credentials);
    }
  }

  /**
   * Upload a single file to AWS S3 using temporary credentials
   */
  public async uploadFile(file: File, credentials: UiUploadCredentials): Promise<void> {
    // Create S3 client using factory with runtime credentials
    const s3Client = this.s3ClientFactory.createS3Client(credentials);

    const command = new PutObjectCommand({
      Bucket: credentials.bucketName,
      Key: file.path,
      Body: file.content,
      ContentType: this.getContentType(file.path)
    });

    try {
      await s3Client.send(command);
    } catch (error) {
      throw new WaldeLocalError('Failed to upload to S3', error as Error, { filePath: file.path });
    }
  }

  /**
   * Determine content type based on file extension
   */
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
      default:
        return 'application/octet-stream';
    }
  }
}
