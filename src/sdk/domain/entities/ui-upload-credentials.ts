/**
 * Upload credentials for UI file operations
 * Framework-agnostic representation of temporary upload credentials
 */
export class UiUploadCredentials {
  constructor(
    public readonly accessKey: string,
    public readonly secretKey: string,
    public readonly sessionToken: string,
    public readonly expiration: Date,
    public readonly region: string,
    public readonly bucketName: string
  ) {}

  /**
   * Check if credentials have expired
   */
  public isExpired(): boolean {
    return new Date() > this.expiration;
  }

  /**
   * Check if credentials are valid (not expired and have required fields)
   */
  public isValid(): boolean {
    return !this.isExpired() && 
           !!this.accessKey && 
           !!this.secretKey && 
           !!this.sessionToken &&
           !!this.region &&
           !!this.bucketName;
  }
}
