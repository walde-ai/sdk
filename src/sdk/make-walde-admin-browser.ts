import { CredentialsProvider } from './domain/ports/out/credentials-provider';
import { IWebSocketClientFactory } from './domain/ports/in/web-socket-client-factory';
import { BrowserWebSocketClientFactory } from './infra/adapters/browser-web-socket-client-factory';
import { BrowserCognitoTokenRefreshProvider } from './infra/adapters/browser-cognito-token-refresh-provider';
import { NoOpS3FilesRepoFactory } from './infra/adapters/noop-s3-files-repo-factory';
import { NoOpS3AssetFilesRepoFactory } from './infra/adapters/noop-s3-asset-files-repo-factory';
import { AdminHttpClient } from './infra/adapters/admin-http-client';
import { ApiClient } from './infra/adapters/api-client';
import { DefaultTokenProvider } from './infra/adapters/default-token-provider';
import { HttpSiteRepository } from './infra/adapters/repositories/http-site-repo';
import { HttpProjectRepository } from './infra/adapters/repositories/http-project-repo';
import { HttpBriefRepository } from './infra/adapters/repositories/http-brief-repo';
import { HttpChatSessionRepository } from './infra/adapters/repositories/http-chat-session-repo';
import { HttpContentRepo } from './infra/adapters/http/http-content-repo';
import { HttpAssetEventRepo } from './infra/adapters/repositories/http-asset-event-repo';
import { WriterApiAwsUiUploadCredentialsRepo } from './infra/adapters/repositories/writer-api-aws-ui-upload-credentials-repo';
import { WriterApiAssetUploadCredentialsRepo } from './infra/adapters/repositories/writer-api-asset-upload-credentials-repo';
import { HttpCacheInvalidationRepo } from './infra/adapters/repositories/http-cache-invalidation-repo';
import { WaldeAdminBrowser, WaldeAdminBrowserConfig } from './infra/futures/walde-admin-browser';
import { BackendCommunication } from './domain/ports/out/backend-communication';

export interface WaldeAdminBrowserConfigInput {
  credentialsProvider: CredentialsProvider;
  endpoint: string;
  wsEndpoint: string;
  clientId: string;
  region: string;
  userPoolId: string;
  webSocketClientFactory?: IWebSocketClientFactory;
}

function createBrowserAdminConfig(config: WaldeAdminBrowserConfigInput): WaldeAdminBrowserConfig {
  const webSocketClientFactory = config.webSocketClientFactory ?? new BrowserWebSocketClientFactory();
  const tokenRefreshProvider = new BrowserCognitoTokenRefreshProvider(
    config.clientId,
    config.userPoolId,
    config.region,
  );
  const tokenProvider = new DefaultTokenProvider(config.credentialsProvider, tokenRefreshProvider);
  const httpClient = new AdminHttpClient(config.endpoint, tokenProvider);
  const backendCommunication: BackendCommunication = new ApiClient(httpClient);
  const apiClient = backendCommunication as ApiClient;

  return {
    credentialsProvider: config.credentialsProvider,
    sitesRepo: new HttpSiteRepository(apiClient),
    projectsRepo: new HttpProjectRepository(apiClient),
    briefRepo: new HttpBriefRepository(apiClient),
    contentRepo: new HttpContentRepo(apiClient),
    uiUploadCredentialsRepo: new WriterApiAwsUiUploadCredentialsRepo(apiClient),
    assetUploadCredentialsRepo: new WriterApiAssetUploadCredentialsRepo(apiClient),
    cacheInvalidationRepo: new HttpCacheInvalidationRepo(apiClient),
    s3FilesRepoFactory: new NoOpS3FilesRepoFactory(),
    s3AssetFilesRepoFactory: new NoOpS3AssetFilesRepoFactory(),
    backendCommunication,
    wsEndpoint: config.wsEndpoint,
    tokenProvider,
    tokenRefreshProvider,
    webSocketClientFactory,
    assetEventRepo: new HttpAssetEventRepo(apiClient),
    chatSessionRepo: new HttpChatSessionRepository(apiClient),
  };
}

/**
 * Browser entry point for creating WaldeAdmin instances.
 * Wires browser-compatible dependencies into a browser-safe admin graph that
 * avoids Node-only futures and adapters.
 */
export function MakeWaldeAdmin(config: WaldeAdminBrowserConfigInput): WaldeAdminBrowser {
  const browserAdminConfig = createBrowserAdminConfig(config);
  return new WaldeAdminBrowser(browserAdminConfig);
}
