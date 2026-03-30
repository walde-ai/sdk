import { Future, Result } from '@/std';
import { CredentialsFuture } from './credentials-future';
import { SitesFuture } from './sites-future';
import { SiteFuture } from './site-future';
import { WorkspaceFuture } from './workspace-future';
import { ApiFuture } from './api-future';
import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';
import { ContentRepo } from '@/sdk/domain/ports/out/content-repo';
import { WorkspaceConfigRepo } from '@/sdk/domain/ports/out/workspace-config-repo';
import { WaldeConfigurationError, WaldeUsageError } from '@/sdk/domain/errors';
import { UiUploadCredentialsRepo } from '@/sdk/domain/ports/out/ui-upload-credentials-repo';
import { AssetUploadCredentialsRepo } from '@/sdk/domain/ports/out/asset-upload-credentials-repo';
import { CacheInvalidationRepo } from '@/sdk/domain/ports/out/cache-invalidation-repo';
import { BackendCommunication } from '@/sdk/domain/ports/out/backend-communication';
import { S3FilesRepoFactory } from '@/sdk/domain/interactors/ui/upload-ui-from-folder';
import { AssetS3FilesRepoFactory } from '@/sdk/domain/interactors/asset/upload-asset-from-folder';
import { InitWorkspace } from '@/sdk/domain/interactors/workspace/init-workspace';
import { WaldeAdminConfigData } from '@/sdk/domain/entities/walde-admin-config';

interface WaldeAdminConfig {
  credentialsProvider: CredentialsProvider;
  sitesRepo: SiteRepository;
  contentRepo: ContentRepo;
  workspaceConfigRepo?: WorkspaceConfigRepo;
  uiUploadCredentialsRepo: UiUploadCredentialsRepo;
  assetUploadCredentialsRepo: AssetUploadCredentialsRepo;
  cacheInvalidationRepo: CacheInvalidationRepo;
  s3FilesRepoFactory: S3FilesRepoFactory;
  s3AssetFilesRepoFactory: AssetS3FilesRepoFactory;
  backendCommunication: BackendCommunication;
  config: WaldeAdminConfigData;
}

export class WaldeAdmin extends Future<never, never> {
  private config: WaldeAdminConfig;

  constructor(config: WaldeAdminConfig) {
    super({ parent: undefined as never });
    this.config = config;
  }

  credentials(): CredentialsFuture {
    return new CredentialsFuture({ parent: this });
  }

  sites(): SitesFuture {
    return new SitesFuture({ parent: this, sitesRepo: this.config.sitesRepo });
  }

  site(params: { id: string }): SiteFuture {
    return new SiteFuture({ parent: this, sitesRepo: this.config.sitesRepo, siteId: params.id });
  }

  workspace(): WorkspaceFuture {
    if (!this.config.workspaceConfigRepo) {
      throw new WaldeConfigurationError('WorkspaceConfigRepo not configured. Use WaldeFactory.create() to get a properly configured instance.');
    }
    const initWorkspace = new InitWorkspace(this.config.workspaceConfigRepo);
    return new WorkspaceFuture({ parent: this, initWorkspace });
  }

  api(): ApiFuture {
    if (!this.config.backendCommunication) {
      throw new WaldeConfigurationError('BackendCommunication not configured. Use WaldeFactory.create() to get a properly configured instance.');
    }
    return new ApiFuture({ parent: this, backendCommunication: this.config.backendCommunication });
  }

  async resolve(): Promise<Result<never, any>> {
    throw new WaldeUsageError('WaldeAdmin is not directly resolvable');
  }

  getConfig(): WaldeAdminConfig {
    return this.config;
  }

  get uiUploadCredentialsRepo(): UiUploadCredentialsRepo {
    return this.config.uiUploadCredentialsRepo;
  }

  get s3FilesRepoFactory(): S3FilesRepoFactory {
    return this.config.s3FilesRepoFactory;
  }

  get assetUploadCredentialsRepo(): AssetUploadCredentialsRepo {
    return this.config.assetUploadCredentialsRepo;
  }

  get s3AssetFilesRepoFactory(): AssetS3FilesRepoFactory {
    return this.config.s3AssetFilesRepoFactory;
  }

  get cacheInvalidationRepo(): CacheInvalidationRepo {
    return this.config.cacheInvalidationRepo;
  }
}
