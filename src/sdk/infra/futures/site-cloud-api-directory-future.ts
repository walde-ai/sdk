import { promises as fs } from 'fs';
import path from 'path';

import { WaldeConfigurationError } from '@/sdk/domain/errors';
import type { WaldeAdmin } from '@/sdk/infra/futures/walde-admin-future';
import { Future, Result, ok } from '@/std';
import { SiteCloudApiPushFuture } from './site-cloud-api-push-future';

export interface SiteCloudApiDirectoryFutureParams {
  parent: WaldeAdmin;
  siteId: string;
  directoryPath: string;
}

export class SiteCloudApiDirectoryFuture extends Future<SiteCloudApiDirectoryFuture, WaldeAdmin> {
  private readonly siteId: string;
  private readonly directoryPath: string;

  constructor(params: SiteCloudApiDirectoryFutureParams) {
    super({ parent: params.parent });
    this.siteId = params.siteId;
    this.directoryPath = params.directoryPath;
  }

  push(): SiteCloudApiPushFuture {
    return new SiteCloudApiPushFuture({
      parent: this.parent,
      siteId: this.siteId,
      filePaths: [],
      filePathsProvider: async (): Promise<string[]> => await this.resolveFilePaths(),
    });
  }

  async resolve(): Promise<Result<SiteCloudApiDirectoryFuture, never>> {
    return ok(this);
  }

  async resolveFilePaths(): Promise<string[]> {
    const stat = await fs.stat(this.directoryPath);
    if (!stat.isDirectory()) {
      throw new WaldeConfigurationError('Cloud API directory path must be a directory', { path: this.directoryPath });
    }

    const entries = await fs.readdir(this.directoryPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts')
      .map(entry => path.join(this.directoryPath, entry.name))
      .sort();
  }
}
