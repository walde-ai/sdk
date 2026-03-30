import { Future, Result, ok, err } from '@/std';
import { WaldeAdmin } from './walde-admin-future';
import { Site } from '@/sdk/domain/entities/site';
import { ListSites } from '@/sdk/domain/interactors/list-sites';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';
import { SiteFuture } from './site-future';

export class SitesFuture extends Future<Site[], WaldeAdmin> {
  private operation: 'list' | null = null;

  constructor({ parent, sitesRepo }: { parent: WaldeAdmin; sitesRepo: SiteRepository }) {
    super({ parent });
    this.sitesRepo = sitesRepo;
  }

  private sitesRepo: SiteRepository;

  list(): SitesFuture {
    const future = new SitesFuture({ parent: this.parent, sitesRepo: this.sitesRepo });
    future.operation = 'list';
    return future;
  }

  create({ name, region }: { name: string; region: string }): SiteFuture {
    const future = new SiteFuture({ parent: this.parent, sitesRepo: this.sitesRepo });
    future.setCreateOperation(name, region);
    return future;
  }

  async resolve(): Promise<Result<Site[], string>> {
    if (!this.operation) {
      return err('No operation specified');
    }

    switch (this.operation) {
      case 'list': {
        const listSites = new ListSites(this.sitesRepo);
        return await listSites.execute();
      }
      default:
        return err(`Unknown operation: ${this.operation}`);
    }
  }
}
