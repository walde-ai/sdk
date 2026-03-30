import { WaldeAdminFactory } from './infra/factories/walde-admin-factory';
import { WaldeAdmin } from './infra/futures/walde-admin-future';
import { CredentialsProvider } from './domain/ports/out/credentials-provider';
import { S3ClientFactory } from './domain/ports/out/s3-client-factory';

export interface WaldeAdminConfig {
  credentialsProvider: CredentialsProvider;
  endpoint?: string;
  clientId?: string;
  region?: string;
  stage?: string;
  s3ClientFactory?: S3ClientFactory;
}

/**
 * Customer-facing factory function for creating WaldeAdmin instances
 */
export function MakeWaldeAdmin(config: WaldeAdminConfig): WaldeAdmin {
  return WaldeAdminFactory.createAdmin(config);
}
