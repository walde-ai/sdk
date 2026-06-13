import { Future, Result, ok, err } from '@/std';
import type { WaldeAdmin } from './walde-admin-future';
import { Site, SiteState } from '@/sdk/domain/entities';
import { CreateSite } from '@/sdk/domain/interactors/create-site';
import { DeleteSite } from '@/sdk/domain/interactors/delete-site';
import { AddCustomDomainToSite } from '@/sdk/domain/interactors/add-custom-domain';
import { AssociateSiteCertificates } from '@/sdk/domain/interactors/associate-site-certificates';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';
import { ContentsFuture } from './contents-future';
import { ContentFuture } from './content-future';
import { ContentIterator } from './content-iterator';
import { UiFuture } from './ui-future';
import { AssetFuture } from './asset-future';
import { AssetUploadFolderFuture } from './asset-upload-folder-future';
import { CacheInvalidationFuture } from './cache-invalidation-future';
import { WaldeConfigurationError } from '@/sdk/domain/errors';
import { SiteCloudFuture } from './site-cloud-future';

const DEFAULT_READY_TIMEOUT_MS = 10 * 60 * 1000;
const INITIAL_POLL_INTERVAL_MS = 1000;
const MAX_POLL_INTERVAL_MS = 180 * 1000;

export class SiteFuture extends Future<Site, WaldeAdmin> {
  private operation: 'create' | 'associateCertificates' | 'addCustomDomain' | 'ready' | 'delete' | 'awaitDeleted' | 'get' | null = null;
  private name?: string;
  private region?: string;
  private siteId?: string;
  private domain?: string;
  private sitesRepo: SiteRepository;
  private readyTimeoutMs: number = DEFAULT_READY_TIMEOUT_MS;

  constructor({ parent, sitesRepo, siteId }: { parent: WaldeAdmin; sitesRepo: SiteRepository; siteId?: string }) {
    super({ parent });
    this.sitesRepo = sitesRepo;
    this.siteId = siteId;
  }

  setCreateOperation(name: string, region: string): void {
    this.operation = 'create';
    this.name = name;
    this.region = region;
  }

  associateCertificates(): SiteFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for certificate association');
    }
    const future = new SiteFuture({ parent: this.parent, sitesRepo: this.sitesRepo });
    future.operation = 'associateCertificates';
    future.siteId = this.siteId;
    return future;
  }

  addCustomDomain(domain: string): SiteFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for adding custom domain');
    }
    const future = new SiteFuture({ parent: this.parent, sitesRepo: this.sitesRepo });
    future.operation = 'addCustomDomain';
    future.siteId = this.siteId;
    future.domain = domain;
    return future;
  }

  delete(): SiteFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for delete operation');
    }
    const future = new SiteFuture({ parent: this.parent, sitesRepo: this.sitesRepo });
    future.operation = 'delete';
    future.siteId = this.siteId;
    return future;
  }

  awaitDeleted(params?: { timeoutMs?: number }): SiteFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for awaitDeleted operation');
    }
    const future = new SiteFuture({ parent: this.parent, sitesRepo: this.sitesRepo });
    future.operation = 'awaitDeleted';
    future.siteId = this.siteId;
    future.readyTimeoutMs = params?.timeoutMs ?? DEFAULT_READY_TIMEOUT_MS;
    return future;
  }

  get(): SiteFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for get operation');
    }
    const future = new SiteFuture({ parent: this.parent, sitesRepo: this.sitesRepo });
    future.operation = 'get';
    future.siteId = this.siteId;
    return future;
  }

  /**
   * Returns a future that polls GET /v1/sites/{id} with exponential backoff
   * until the site transitions out of a pending state (UPDATE_REQUESTED or
   * DELETE_REQUESTED).
   *
   * Resolves successfully when state becomes UPDATED or DELETED.
   * Returns an error if state becomes ERROR or if the timeout is reached.
   *
   * @param params - Optional configuration
   * @param params.timeoutMs - Maximum polling duration (default: 5 minutes)
   */
  ready(params?: { timeoutMs?: number }): SiteFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for ready operation');
    }
    const future = new SiteFuture({ parent: this.parent, sitesRepo: this.sitesRepo });
    future.operation = 'ready';
    future.siteId = this.siteId;
    future.readyTimeoutMs = params?.timeoutMs ?? DEFAULT_READY_TIMEOUT_MS;
    return future;
  }

  contents(): ContentsFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for content operations');
    }
    return new ContentsFuture({ parent: this.parent, siteId: this.siteId });
  }

  content(params: { id: string }): ContentFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for content operations');
    }
    return new ContentFuture({ parent: this.parent, siteId: this.siteId, contentId: params.id });
  }

  setContentFromFile(params: { path: string }): ContentFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for content operations');
    }
    return new ContentFuture({ parent: this.parent, siteId: this.siteId, filePath: params.path });
  }

  uploadContentsFromFolder(params: { path: string; onProgress?: (current: number, total: number, filePath: string, success: boolean, error?: Error) => void }): ContentIterator {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for content operations');
    }
    return new ContentIterator({ parent: this.parent, siteId: this.siteId, folderPath: params.path, onProgress: params.onProgress || (() => {}) });
  }

  uploadUiFromFolder(params: { path: string; onProgress?: (current: number, total: number, filePath: string, success: boolean, error?: Error) => void }): UiFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for UI operations');
    }
    
    return new UiFuture({
      parent: this.parent,
      siteId: this.siteId,
      uiUploadCredentialsRepo: this.parent.uiUploadCredentialsRepo,
      s3FilesRepoFactory: this.parent.s3FilesRepoFactory,
      uploadPath: params.path,
      onProgress: params.onProgress || (() => {})
    });
  }

  uploadAssetsFromFolder(params: { path: string; onProgress?: (current: number, total: number, filePath: string, success: boolean, error?: Error) => void }): AssetUploadFolderFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for asset operations');
    }
    return new AssetUploadFolderFuture({
      parent: this.parent,
      siteId: this.siteId,
      assetUploadCredentialsRepo: this.parent.assetUploadCredentialsRepo,
      s3AssetFilesRepoFactory: this.parent.s3AssetFilesRepoFactory,
      uploadPath: params.path,
      onProgress: params.onProgress || (() => {})
    });
  }

  asset(params: { key: string }): AssetFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for asset operations');
    }
    return new AssetFuture({
      parent: this.parent,
      siteId: this.siteId,
      assetKey: params.key,
      assetUploadCredentialsRepo: this.parent.assetUploadCredentialsRepo,
      s3AssetFilesRepoFactory: this.parent.s3AssetFilesRepoFactory
    });
  }

  invalidateCache(): CacheInvalidationFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for cache operations');
    }
    return new CacheInvalidationFuture({
      parent: this.parent,
      siteId: this.siteId,
      cacheInvalidationRepo: this.parent.cacheInvalidationRepo
    });
  }

  cloud(): SiteCloudFuture {
    if (!this.siteId) {
      throw new WaldeConfigurationError('Site ID required for cloud operations');
    }
    return new SiteCloudFuture({
      parent: this.parent,
      siteId: this.siteId,
    });
  }

  async resolve(): Promise<Result<Site, string>> {
    if (!this.operation) {
      return err('No operation specified');
    }

    switch (this.operation) {
      case 'create': {
        if (this.name === undefined) {
          return err('Name required for create operation');
        }
        if (!this.region) {
          return err('Region required for create operation');
        }
        const createSite = new CreateSite(this.sitesRepo);
        return await createSite.execute(this.name, this.region);
      }
      case 'associateCertificates': {
        if (!this.siteId) {
          return err('Site ID required for associateCertificates operation');
        }
        const associateCerts = new AssociateSiteCertificates(this.sitesRepo);
        return await associateCerts.execute(this.siteId);
      }
      case 'addCustomDomain': {
        if (!this.siteId) {
          return err('Site ID required for addCustomDomain operation');
        }
        if (!this.domain) {
          return err('Domain required for addCustomDomain operation');
        }
        const addCustomDomain = new AddCustomDomainToSite(this.sitesRepo);
        return await addCustomDomain.execute(this.siteId, this.domain);
      }
      case 'ready': {
        if (!this.siteId) {
          return err('Site ID required for ready operation');
        }
        return await this.pollUntilReady(this.siteId, this.readyTimeoutMs);
      }
      case 'delete': {
        if (!this.siteId) {
          return err('Site ID required for delete operation');
        }
        const deleteSite = new DeleteSite(this.sitesRepo);
        return await deleteSite.execute(this.siteId);
      }
      case 'awaitDeleted': {
        if (!this.siteId) {
          return err('Site ID required for awaitDeleted operation');
        }
        return await this.pollUntilDeleted(this.siteId, this.readyTimeoutMs);
      }
      case 'get': {
        if (!this.siteId) {
          return err('Site ID required for get operation');
        }
        const site = await this.sitesRepo.get(this.siteId);
        return ok(site);
      }
      default:
        return err(`Unknown operation: ${this.operation}`);
    }
  }

  private async pollUntilReady(siteId: string, timeoutMs: number): Promise<Result<Site, string>> {
    const startTime = Date.now();
    let intervalMs = INITIAL_POLL_INTERVAL_MS;
    let lastError: unknown = null;

    while (true) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeoutMs) {
        const detail = lastError instanceof Error ? `: ${lastError.message}` : '';
        return err(`Timed out waiting for site provisioning to complete${detail}`);
      }

      try {
        const site = await this.sitesRepo.get(siteId);
        lastError = null;

        if (site.state === SiteState.UPDATED || site.state === SiteState.DELETED) {
          return ok(site);
        }

        if (site.state === SiteState.ERROR) {
          return err('Site provisioning failed');
        }
      } catch (error: unknown) {
        lastError = error;
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
      intervalMs = Math.min(intervalMs * 2, MAX_POLL_INTERVAL_MS);
    }
  }

  private async pollUntilDeleted(siteId: string, timeoutMs: number): Promise<Result<Site, string>> {
    const startTime = Date.now();
    let intervalMs = INITIAL_POLL_INTERVAL_MS;
    let lastError: unknown = null;

    while (true) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeoutMs) {
        const detail = lastError instanceof Error ? `: ${lastError.message}` : '';
        return err(`Timed out waiting for site deletion to complete${detail}`);
      }

      try {
        const site = await this.sitesRepo.get(siteId);
        lastError = null;

        if (site.state === SiteState.DELETED) {
          return ok(site);
        }

        if (site.state === SiteState.ERROR) {
          return err('Site deletion failed');
        }
      } catch (error: unknown) {
        lastError = error;
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
      intervalMs = Math.min(intervalMs * 2, MAX_POLL_INTERVAL_MS);
    }
  }
}
