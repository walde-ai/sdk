import { PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Mock S3 client that sends requests to writer-api mock server
 */
export class S3MockClient {
  private credentials: any;

  constructor(private readonly endpoint: string, credentials?: any) {
    this.credentials = credentials;
  }

  /**
   * Send command to mock S3 server
   */
  async send(command: PutObjectCommand): Promise<any> {
    if (!(command instanceof PutObjectCommand)) {
      throw new Error('Only PutObjectCommand is supported');
    }

    const input = command.input;
    const url = `${this.endpoint}/${input.Bucket}/${input.Key}`;
    
    const headers: Record<string, string> = {
      'Content-Type': input.ContentType || 'application/octet-stream'
    };

    if (this.credentials?.sessionToken) {
      headers['X-Amz-Security-Token'] = this.credentials.sessionToken;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: input.Body as BodyInit
    });

    if (response.status === 403) {
      throw new Error('Access denied: Invalid credentials or insufficient permissions');
    }

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
    }

    return {};
  }
}
