import { Result, ok, err } from '@/std';
import { Site } from '@/sdk/domain/entities/site';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';

export class AddCustomDomainToSite {
  constructor(private readonly siteRepository: SiteRepository) {}

  async execute(siteId: string, domain: string): Promise<Result<Site, string>> {
    try {
      const updatedSite = await this.siteRepository.addCustomDomain(siteId, domain);
      return ok(updatedSite);
    } catch (error) {
      return err(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
