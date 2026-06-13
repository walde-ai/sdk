import { WaldeAdminFactory, WaldeAdminFactoryConfig } from './infra/factories/walde-admin-factory';
import { WaldeAdmin } from './infra/futures/walde-admin-future';
import { CredentialsProvider } from './domain/ports/out/credentials-provider';
import { S3ClientFactory } from './domain/ports/out/s3-client-factory';
import { IWebSocketClientFactory } from './domain/ports/in/web-socket-client-factory';
import { NodeWebSocketClientFactory } from './infra/adapters/node-web-socket-client-factory';
import { CognitoTokenRefreshProvider } from './infra/adapters/cognito-token-refresh-provider';
import { AwsS3ClientFactory } from './infra/adapters/aws-s3-client-factory';
import { FileWorkspaceConfigRepo } from './infra/adapters/repositories/file-workspace-config-repo';
import { WaldeAdminConfigFactory } from './infra/factories/walde-admin-config-factory';
import { DefaultS3FilesRepoFactory } from './infra/factories/s3-files-repo-factory';
import { DefaultS3AssetFilesRepoFactory } from './infra/factories/s3-asset-files-repo-factory';

export interface WaldeAdminConfig {
  credentialsProvider: CredentialsProvider;
  endpoint?: string;
  clientId?: string;
  region?: string;
  stage?: string;
  s3ClientFactory?: S3ClientFactory;
  webSocketClientFactory?: IWebSocketClientFactory;
  wsEndpoint?: string;
}

/**
 * Node.js entry point for creating WaldeAdmin instances.
 * Wires Node-specific dependencies (NodeWebSocketClientFactory, CognitoTokenRefreshProvider,
 * AwsS3ClientFactory, FileWorkspaceConfigRepo) into the unified WaldeAdminFactory.
 * Supports file-based config fallback for endpoint, clientId, etc.
 */
export function MakeWaldeAdmin(config: WaldeAdminConfig): WaldeAdmin {
  const completeConfig = WaldeAdminConfigFactory.create({
    endpoint: config.endpoint,
    wsEndpoint: config.wsEndpoint,
    clientId: config.clientId,
    region: config.region,
    s3ClientFactory: config.s3ClientFactory,
  }, config.stage);

  const s3ClientFactory = config.s3ClientFactory ?? new AwsS3ClientFactory();
  const webSocketClientFactory = config.webSocketClientFactory ?? new NodeWebSocketClientFactory();
  const tokenRefreshProvider = new CognitoTokenRefreshProvider(completeConfig.clientId, completeConfig.region);
  const workspaceConfigRepo = new FileWorkspaceConfigRepo();

  const factoryConfig: WaldeAdminFactoryConfig = {
    credentialsProvider: config.credentialsProvider,
    endpoint: completeConfig.endpoint,
    wsEndpoint: completeConfig.wsEndpoint,
    clientId: completeConfig.clientId,
    region: completeConfig.region,
    webSocketClientFactory,
    tokenRefreshProvider,
    s3ClientFactory,
    s3FilesRepoFactory: new DefaultS3FilesRepoFactory(s3ClientFactory),
    s3AssetFilesRepoFactory: new DefaultS3AssetFilesRepoFactory(s3ClientFactory),
    workspaceConfigRepo,
  };

  return WaldeAdminFactory.createAdmin(factoryConfig);
}
