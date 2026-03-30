import { Result, ok, err } from '@/std';
import { Site, SiteState } from '@/sdk/domain/entities/site';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';

export class DeleteSite {
  constructor(private readonly siteRepository: SiteRepository) {}

  async execute(siteId: string): Promise<Result<Site, string>> {
    try {
      const site = new Site(siteId, '', SiteState.DELETE_REQUESTED);
      const savedSite = await this.siteRepository.save(site);
      return ok(savedSite);
    } catch (error) {
      return err(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
