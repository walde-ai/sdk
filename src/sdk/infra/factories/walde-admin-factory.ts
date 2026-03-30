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
import { HttpSiteRepository } from '@/sdk/infra/adapters/repositories/http-site-repo';
import { HttpContentRepo } from '@/sdk/infra/adapters/http/http-content-repo';
import { FileWorkspaceConfigRepo } from '@/sdk/infra/adapters/repositories/file-workspace-config-repo';
import { WriterApiAwsUiUploadCredentialsRepo } from '@/sdk/infra/adapters/repositories/writer-api-aws-ui-upload-credentials-repo';
import { WriterApiAssetUploadCredentialsRepo } from '@/sdk/infra/adapters/repositories/writer-api-asset-upload-credentials-repo';
import { HttpCacheInvalidationRepo } from '@/sdk/infra/adapters/repositories/http-cache-invalidation-repo';
import { DefaultS3FilesRepoFactory } from './s3-files-repo-factory';
import { DefaultS3AssetFilesRepoFactory } from './s3-asset-files-repo-factory';
import { AwsS3ClientFactory } from '@/sdk/infra/adapters/aws-s3-client-factory';
import { ApiClient } from '@/sdk/infra/adapters/api-client';
import { AdminHttpClient } from '@/sdk/infra/adapters/admin-http-client';
import { DefaultTokenProvider } from '@/sdk/infra/adapters/default-token-provider';
import { WaldeAdminConfigFactory } from './walde-admin-config-factory';

interface WaldeAdminFactoryConfig {
  credentialsProvider: CredentialsProvider;
  endpoint?: string;
  clientId?: string;
  region?: string;
  stage?: string;
  s3ClientFactory?: S3ClientFactory;
}

/**
 * Factory for creating properly configured WaldeAdmin instances
 */
export class WaldeAdminFactory {
  public static createAdmin(config: WaldeAdminFactoryConfig): WaldeAdmin {
    const completeConfig = WaldeAdminConfigFactory.create({
      endpoint: config.endpoint,
      clientId: config.clientId,
      region: config.region,
      s3ClientFactory: config.s3ClientFactory
    }, config.stage);

    const tokenProvider = new DefaultTokenProvider(
      config.credentialsProvider,
      completeConfig.clientId,
      completeConfig.region
    );
    const httpClient = new AdminHttpClient(completeConfig.endpoint, tokenProvider);
    const apiClient = new ApiClient(httpClient);
    const sitesRepo: SiteRepository = new HttpSiteRepository(apiClient);
    const contentRepo: ContentRepo = new HttpContentRepo(apiClient);
    const workspaceConfigRepo: WorkspaceConfigRepo = new FileWorkspaceConfigRepo();
    const uiUploadCredentialsRepo: UiUploadCredentialsRepo = new WriterApiAwsUiUploadCredentialsRepo(apiClient);
    const assetUploadCredentialsRepo: AssetUploadCredentialsRepo = new WriterApiAssetUploadCredentialsRepo(apiClient);
    const cacheInvalidationRepo: CacheInvalidationRepo = new HttpCacheInvalidationRepo(apiClient);
    const s3FilesRepoFactory: S3FilesRepoFactory = new DefaultS3FilesRepoFactory(completeConfig.s3ClientFactory);
    const s3AssetFilesRepoFactory = new DefaultS3AssetFilesRepoFactory(completeConfig.s3ClientFactory);
    const backendCommunication: BackendCommunication = apiClient;

    return new WaldeAdmin({
      credentialsProvider: config.credentialsProvider,
      sitesRepo,
      contentRepo,
      workspaceConfigRepo,
      uiUploadCredentialsRepo,
      assetUploadCredentialsRepo,
      cacheInvalidationRepo,
      s3FilesRepoFactory,
      s3AssetFilesRepoFactory,
      backendCommunication,
      config: completeConfig
    });
  }
}
