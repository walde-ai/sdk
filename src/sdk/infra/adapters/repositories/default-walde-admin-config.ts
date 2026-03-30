import { StaticWaldeAdminConfig } from './static-walde-admin-config';
import { WaldeAdminConfigData, PartialWaldeAdminConfigData } from '@/sdk/domain/entities/walde-admin-config';
import { AwsS3ClientFactory } from '@/sdk/infra/adapters/aws-s3-client-factory';

/**
 * Factory for creating default configuration with fallback values
 */
export class DefaultWaldeAdminConfig {
  /**
   * Create a StaticWaldeAdminConfig with default values
   */
  public static create(): StaticWaldeAdminConfig {
    const defaultConfig: WaldeAdminConfigData = {
      endpoint: 'https://api.walde.ai',
      clientId: '2na3vdtebghu3se9rvimtuiaej',
      region: 'eu-central-1',
      userPoolId: 'eu-central-1_XLyUuL5PG',
      s3ClientFactory: new AwsS3ClientFactory()
    };

    // Cast to partial for StaticWaldeAdminConfig constructor
    return new StaticWaldeAdminConfig(defaultConfig as PartialWaldeAdminConfigData);
  }
}
