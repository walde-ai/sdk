import { WaldeAdmin } from '@/sdk/infra/futures/walde-admin-future';
import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';
import { ContentRepo } from '@/sdk/domain/ports/out/content-repo';
import { WorkspaceConfigRepo } from '@/sdk/domain/ports/out/workspace-config-repo';
import { UiUploadCredentialsRepo } from '@/sdk/domain/ports/out/ui-upload-credentials-repo';
import { AssetUploadCredentialsRepo } from '@/sdk/domain/ports/out/asset-upload-credentials-repo';
import { CacheInvalidationRepo } from '@/sdk/domain/ports/out/cache-invalidation-repo';
import { BackendCommunication } from '@/sdk/domain/ports/out/backend-communication';
import { S3ClientFactory } from '@/sdk/domain/ports/out/s3-client-factory';
import { S3FilesRepoFactory } from '@/sdk/domain/interactors/ui/upload-ui-from-folder';
import { AssetS3FilesRepoFactory } from '@/sdk/domain/interactors/asset/upload-asset-from-folder';
import { TokenRefreshProvider } from '@/sdk/domain/ports/out/token-refresh-provider';
import { HttpSiteRepository } from '@/sdk/infra/adapters/repositories/http-site-repo';
import { HttpProjectRepository } from '@/sdk/infra/adapters/repositories/http-project-repo';
import { HttpBriefRepository } from '@/sdk/infra/adapters/repositories/http-brief-repo';
import { HttpChatSessionRepository } from '@/sdk/infra/adapters/repositories/http-chat-session-repo';
import { HttpContentRepo } from '@/sdk/infra/adapters/http/http-content-repo';
import { HttpAssetEventRepo } from '@/sdk/infra/adapters/repositories/http-asset-event-repo';
import { WriterApiAwsUiUploadCredentialsRepo } from '@/sdk/infra/adapters/repositories/writer-api-aws-ui-upload-credentials-repo';
import { WriterApiAssetUploadCredentialsRepo } from '@/sdk/infra/adapters/repositories/writer-api-asset-upload-credentials-repo';
import { HttpCacheInvalidationRepo } from '@/sdk/infra/adapters/repositories/http-cache-invalidation-repo';
import { ApiClient } from '@/sdk/infra/adapters/api-client';
import { AdminHttpClient } from '@/sdk/infra/adapters/admin-http-client';
import { DefaultTokenProvider } from '@/sdk/infra/adapters/default-token-provider';
import { IWebSocketClientFactory } from '@/sdk/domain/ports/in/web-socket-client-factory';

export interface WaldeAdminFactoryConfig {
  credentialsProvider: CredentialsProvider;
  endpoint: string;
  wsEndpoint: string;
  clientId: string;
  region: string;
  webSocketClientFactory: IWebSocketClientFactory;
  tokenRefreshProvider: TokenRefreshProvider;
  s3ClientFactory: S3ClientFactory;
  s3FilesRepoFactory: S3FilesRepoFactory;
  s3AssetFilesRepoFactory: AssetS3FilesRepoFactory;
  workspaceConfigRepo?: WorkspaceConfigRepo;
}

/**
 * Environment-agnostic factory for creating properly configured WaldeAdmin instances.
 * All environment-specific dependencies are accepted as config parameters.
 */
export class WaldeAdminFactory {
  public static createAdmin(config: WaldeAdminFactoryConfig): WaldeAdmin {
    const tokenProvider = new DefaultTokenProvider(
      config.credentialsProvider,
      config.tokenRefreshProvider
    );
    const httpClient = new AdminHttpClient(config.endpoint, tokenProvider);
    const apiClient = new ApiClient(httpClient);
    const sitesRepo: SiteRepository = new HttpSiteRepository(apiClient);
    const projectsRepo = new HttpProjectRepository(apiClient);
    const briefRepo = new HttpBriefRepository(apiClient);
    const chatSessionRepo = new HttpChatSessionRepository(apiClient);
    const contentRepo: ContentRepo = new HttpContentRepo(apiClient);
    const assetEventRepo = new HttpAssetEventRepo(apiClient);
    const uiUploadCredentialsRepo: UiUploadCredentialsRepo = new WriterApiAwsUiUploadCredentialsRepo(apiClient);
    const assetUploadCredentialsRepo: AssetUploadCredentialsRepo = new WriterApiAssetUploadCredentialsRepo(apiClient);
    const cacheInvalidationRepo: CacheInvalidationRepo = new HttpCacheInvalidationRepo(apiClient);
    const s3FilesRepoFactory: S3FilesRepoFactory = config.s3FilesRepoFactory;
    const s3AssetFilesRepoFactory = config.s3AssetFilesRepoFactory;
    const backendCommunication: BackendCommunication = apiClient;

    const adminConfig = {
      endpoint: config.endpoint,
      wsEndpoint: config.wsEndpoint,
      clientId: config.clientId,
      region: config.region,
      userPoolId: '',
      s3ClientFactory: config.s3ClientFactory,
    };

    return new WaldeAdmin({
      credentialsProvider: config.credentialsProvider,
      sitesRepo,
      projectsRepo,
      briefRepo,
      contentRepo,
      workspaceConfigRepo: config.workspaceConfigRepo,
      uiUploadCredentialsRepo,
      assetUploadCredentialsRepo,
      cacheInvalidationRepo,
      s3FilesRepoFactory,
      s3AssetFilesRepoFactory,
      backendCommunication,
      config: adminConfig,
      tokenProvider,
      tokenRefreshProvider: config.tokenRefreshProvider,
      webSocketClientFactory: config.webSocketClientFactory,
      wsEndpoint: config.wsEndpoint,
      assetEventRepo,
      chatSessionRepo,
    });
  }
}
