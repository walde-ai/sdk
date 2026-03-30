import { Result, ok, err } from '@/std';
import { S3ClientFactory } from '@/sdk/domain/ports/out/s3-client-factory';

/**
 * Partial configuration data for Walde SDK (all optional)
 */
export interface PartialWaldeAdminConfigData {
  endpoint?: string;
  clientId?: string;
  region?: string;
  userPoolId?: string;
  s3ClientFactory?: S3ClientFactory;
}

/**
 * Complete configuration data for Walde SDK (all required)
 */
export interface WaldeAdminConfigData {
  endpoint: string;
  clientId: string;
  region: string;
  userPoolId: string;
  s3ClientFactory: S3ClientFactory;
}

/**
 * Abstract base class for Walde configuration
 */
export abstract class WaldeAdminConfig {
  protected data: PartialWaldeAdminConfigData;

  constructor(data: PartialWaldeAdminConfigData = {}) {
    this.data = { ...data };
  }

  /**
   * Get configuration value
   */
  get endpoint(): string | undefined {
    return this.data.endpoint;
  }

  get clientId(): string | undefined {
    return this.data.clientId;
  }

  get region(): string | undefined {
    return this.data.region;
  }

  get userPoolId(): string | undefined {
    return this.data.userPoolId;
  }

  get s3ClientFactory(): S3ClientFactory | undefined {
    return this.data.s3ClientFactory;
  }

  /**
   * Merge with another config, current values override merged ones when set
   */
  merge(other: WaldeAdminConfig): WaldeAdminConfig {
    const otherData = other.getData();
    const mergedData: PartialWaldeAdminConfigData = {
      endpoint: this.data.endpoint ?? otherData.endpoint,
      clientId: this.data.clientId ?? otherData.clientId,
      region: this.data.region ?? otherData.region,
      userPoolId: this.data.userPoolId ?? otherData.userPoolId,
      s3ClientFactory: this.data.s3ClientFactory ?? otherData.s3ClientFactory
    };
    
    // Create new instance of same type with merged data
    return this.createInstance(mergedData);
  }

  /**
   * Create new instance of the same type with given data
   * Must be implemented by subclasses
   */
  protected abstract createInstance(data: PartialWaldeAdminConfigData): WaldeAdminConfig;

  /**
   * Get all configuration data
   */
  getData(): PartialWaldeAdminConfigData {
    return { ...this.data };
  }

  /**
   * Promote to complete configuration if all required fields are set
   */
  promote(): Result<WaldeAdminConfigData, string> {
    const missing: string[] = [];
    
    if (!this.data.endpoint) missing.push('endpoint');
    if (!this.data.clientId) missing.push('clientId');
    if (!this.data.region) missing.push('region');
    if (!this.data.userPoolId) missing.push('userPoolId');
    
    if (missing.length > 0) {
      return err(`Missing required configuration: ${missing.join(', ')}`);
    }
    
    return ok({
      endpoint: this.data.endpoint!,
      clientId: this.data.clientId!,
      region: this.data.region!,
      userPoolId: this.data.userPoolId!,
      s3ClientFactory: this.data.s3ClientFactory!
    });
  }
}
