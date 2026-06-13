import { Future, Result } from '@/std';
import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';
import { ProjectRepository } from '@/sdk/domain/ports/out/project-repository';
import { BriefRepository } from '@/sdk/domain/ports/out/brief-repository';
import { ContentRepo } from '@/sdk/domain/ports/out/content-repo';
import { UiUploadCredentialsRepo } from '@/sdk/domain/ports/out/ui-upload-credentials-repo';
import { AssetUploadCredentialsRepo } from '@/sdk/domain/ports/out/asset-upload-credentials-repo';
import { CacheInvalidationRepo } from '@/sdk/domain/ports/out/cache-invalidation-repo';
import { BackendCommunication } from '@/sdk/domain/ports/out/backend-communication';
import { S3FilesRepoFactory } from '@/sdk/domain/interactors/ui/upload-ui-from-folder';
import { AssetS3FilesRepoFactory } from '@/sdk/domain/interactors/asset/upload-asset-from-folder';
import { TokenProvider } from '@/sdk/domain/ports/in/token-provider';
import { TokenRefreshProvider } from '@/sdk/domain/ports/out/token-refresh-provider';
import { IWebSocketClientFactory } from '@/sdk/domain/ports/in/web-socket-client-factory';
import { IAssetEventRepo } from '@/sdk/domain/ports/out/asset-event-repo';
import { ChatSessionRepository } from '@/sdk/domain/ports/out/chat-session-repository';
import { WaldeUsageError } from '@/sdk/domain/errors';

import { BrowserSiteFuture } from './browser-site-future';
import { ProjectsFuture } from './projects-future';
import { ProjectFuture } from './project-future';
import { BriefsFuture } from './briefs-future';
import { BriefFuture } from './brief-future';
import { ChatsFuture } from './chats-future';
import { ChatFuture } from './chat-future';
import { WebSocketFuture } from './web-socket-future';

export interface WaldeAdminBrowserConfig {
  credentialsProvider: CredentialsProvider;
  sitesRepo: SiteRepository;
  projectsRepo: ProjectRepository;
  briefRepo: BriefRepository;
  contentRepo: ContentRepo;
  uiUploadCredentialsRepo: UiUploadCredentialsRepo;
  assetUploadCredentialsRepo: AssetUploadCredentialsRepo;
  cacheInvalidationRepo: CacheInvalidationRepo;
  s3FilesRepoFactory: S3FilesRepoFactory;
  s3AssetFilesRepoFactory: AssetS3FilesRepoFactory;
  backendCommunication: BackendCommunication;
  wsEndpoint: string;
  tokenProvider: TokenProvider;
  tokenRefreshProvider: TokenRefreshProvider;
  webSocketClientFactory: IWebSocketClientFactory;
  assetEventRepo: IAssetEventRepo;
  chatSessionRepo: ChatSessionRepository;
}

export class WaldeAdminBrowser extends Future<never, never> {
  constructor(private readonly config: WaldeAdminBrowserConfig) {
    super({ parent: undefined as never });
  }

  site(params: { id: string }): BrowserSiteFuture {
    return new BrowserSiteFuture(this.config.sitesRepo, params.id);
  }

  projects(): ProjectsFuture {
    return new ProjectsFuture({ parent: this as never, projectsRepo: this.config.projectsRepo });
  }

  project(params: { id: string }): ProjectFuture {
    return new ProjectFuture({ parent: this as never, projectsRepo: this.config.projectsRepo, projectId: params.id });
  }

  briefs(): BriefsFuture {
    return new BriefsFuture({ parent: this as never, briefRepo: this.config.briefRepo });
  }

  brief(params: { id: string }): BriefFuture {
    return new BriefFuture({ parent: this as never, briefRepo: this.config.briefRepo, briefId: params.id });
  }

  chats(): ChatsFuture {
    return new ChatsFuture({ parent: this as never, chatSessionRepo: this.config.chatSessionRepo });
  }

  chat(params: { chatId: string }): ChatFuture {
    return new ChatFuture({ parent: this as never, chatSessionRepo: this.config.chatSessionRepo, chatId: params.chatId });
  }

  ws(): WebSocketFuture {
    return new WebSocketFuture({
      parent: this as never,
      wsEndpoint: this.config.wsEndpoint,
      tokenProvider: this.config.tokenProvider,
      webSocketClientFactory: this.config.webSocketClientFactory,
    });
  }

  get contentRepo(): ContentRepo {
    return this.config.contentRepo;
  }

  get uiUploadCredentialsRepo(): UiUploadCredentialsRepo {
    return this.config.uiUploadCredentialsRepo;
  }

  get assetUploadCredentialsRepo(): AssetUploadCredentialsRepo {
    return this.config.assetUploadCredentialsRepo;
  }

  get cacheInvalidationRepo(): CacheInvalidationRepo {
    return this.config.cacheInvalidationRepo;
  }

  get assetEventRepo(): IAssetEventRepo {
    return this.config.assetEventRepo;
  }

  get s3FilesRepoFactory(): S3FilesRepoFactory {
    return this.config.s3FilesRepoFactory;
  }

  get s3AssetFilesRepoFactory(): AssetS3FilesRepoFactory {
    return this.config.s3AssetFilesRepoFactory;
  }

  async resolve(): Promise<Result<never, any>> {
    throw new WaldeUsageError('WaldeAdminBrowser is not directly resolvable');
  }
}
