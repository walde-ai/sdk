import { Result, ok, err } from '@/std';
import { Site } from '@/sdk/domain/entities/site';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';

export class ListSites {
  constructor(private readonly siteRepository: SiteRepository) {}

  async execute(): Promise<Result<Site[], string>> {
    try {
      const sites = await this.siteRepository.getAll();
      return ok(sites);
    } catch (error) {
      return err(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
