import { Result, ok, err } from '@/std';
import { Site, SiteState } from '@/sdk/domain/entities/site';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';

export class CreateSite {
  constructor(private readonly siteRepository: SiteRepository) {}

  async execute(name: string, region: string): Promise<Result<Site, string>> {
    try {
      const newSite = new Site('', name, SiteState.UPDATE_REQUESTED, region);
      const savedSite = await this.siteRepository.save(newSite);
      return ok(savedSite);
    } catch (error) {
      return err(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
