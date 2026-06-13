import { Future, Result } from '@/std';
import { CredentialsFuture } from './credentials-future';
import { SitesFuture } from './sites-future';
import { SiteFuture } from './site-future';
import { ProjectsFuture } from './projects-future';
import { ProjectFuture } from './project-future';
import { BriefsFuture } from './briefs-future';
import { BriefFuture } from './brief-future';
import { WorkspaceFuture } from './workspace-future';
import { ApiFuture } from './api-future';
import { WebSocketFuture } from './web-socket-future';
import { ChatsFuture } from './chats-future';
import { ChatFuture } from './chat-future';
import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';
import { ProjectRepository } from '@/sdk/domain/ports/out/project-repository';
import { BriefRepository } from '@/sdk/domain/ports/out/brief-repository';
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
import { CreateProjectWorkspace } from '@/sdk/domain/interactors/workspace/create-project-workspace';
import { FileSystemScaffoldingRepo } from '@/sdk/infra/adapters/filesystem/file-system-scaffolding-repo';
import { WaldeAdminConfigData } from '@/sdk/domain/entities';
import { IAssetEventRepo } from '@/sdk/domain/ports/out/asset-event-repo';
import { IWebSocketClientFactory } from '@/sdk/domain/ports/in/web-socket-client-factory';
import { TokenProvider } from '@/sdk/domain/ports/in/token-provider';
import { TokenRefreshProvider } from '@/sdk/domain/ports/out/token-refresh-provider';
import { ChatSessionRepository } from '@/sdk/domain/ports/out/chat-session-repository';

interface WaldeAdminConfig {
  credentialsProvider: CredentialsProvider;
  sitesRepo: SiteRepository;
  projectsRepo: ProjectRepository;
  briefRepo: BriefRepository;
  contentRepo: ContentRepo;
  workspaceConfigRepo?: WorkspaceConfigRepo;
  uiUploadCredentialsRepo: UiUploadCredentialsRepo;
  assetUploadCredentialsRepo: AssetUploadCredentialsRepo;
  cacheInvalidationRepo: CacheInvalidationRepo;
  s3FilesRepoFactory: S3FilesRepoFactory;
  s3AssetFilesRepoFactory: AssetS3FilesRepoFactory;
  backendCommunication: BackendCommunication;
  config: WaldeAdminConfigData;
  tokenProvider: TokenProvider;
  tokenRefreshProvider: TokenRefreshProvider;
  webSocketClientFactory: IWebSocketClientFactory;
  wsEndpoint: string;
  assetEventRepo: IAssetEventRepo;
  chatSessionRepo: ChatSessionRepository;
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

  projects(): ProjectsFuture {
    return new ProjectsFuture({ parent: this, projectsRepo: this.config.projectsRepo });
  }

  project(params: { id: string }): ProjectFuture {
    return new ProjectFuture({ parent: this, projectsRepo: this.config.projectsRepo, projectId: params.id });
  }

  briefs(): BriefsFuture {
    return new BriefsFuture({ parent: this, briefRepo: this.config.briefRepo });
  }

  brief(params: { id: string }): BriefFuture {
    return new BriefFuture({ parent: this, briefRepo: this.config.briefRepo, briefId: params.id });
  }

  chats(): ChatsFuture {
    return new ChatsFuture({ parent: this, chatSessionRepo: this.config.chatSessionRepo });
  }

  chat(params: { chatId: string }): ChatFuture {
    return new ChatFuture({ parent: this, chatSessionRepo: this.config.chatSessionRepo, chatId: params.chatId });
  }

  workspace(): WorkspaceFuture {
    if (!this.config.workspaceConfigRepo) {
      throw new WaldeConfigurationError('WorkspaceConfigRepo not configured. Use WaldeFactory.create() to get a properly configured instance.');
    }
    const scaffoldingRepo = new FileSystemScaffoldingRepo();
    const initWorkspace = new InitWorkspace(this.config.workspaceConfigRepo, scaffoldingRepo);
    const createProjectWorkspace = new CreateProjectWorkspace(this.config.workspaceConfigRepo);
    return new WorkspaceFuture({ parent: this, initWorkspace, createProjectWorkspace });
  }

  api(): ApiFuture {
    if (!this.config.backendCommunication) {
      throw new WaldeConfigurationError('BackendCommunication not configured. Use WaldeFactory.create() to get a properly configured instance.');
    }
    return new ApiFuture({ parent: this, backendCommunication: this.config.backendCommunication });
  }

  ws(): WebSocketFuture {
    return new WebSocketFuture({
      parent: this,
      wsEndpoint: this.config.wsEndpoint,
      tokenProvider: this.config.tokenProvider,
      webSocketClientFactory: this.config.webSocketClientFactory,
    });
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

  get contentRepo(): ContentRepo {
    return this.config.contentRepo;
  }

  get assetEventRepo(): IAssetEventRepo {
    return this.config.assetEventRepo;
  }
}
