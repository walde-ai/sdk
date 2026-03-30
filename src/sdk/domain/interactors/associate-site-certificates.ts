import { Result, ok, err } from '@/std';
import { Site } from '@/sdk/domain/entities/site';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';

/**
 * Interactor for associating validated ACM certificates with CloudFront distributions.
 */
export class AssociateSiteCertificates {
  constructor(private readonly siteRepository: SiteRepository) {}

  async execute(siteId: string): Promise<Result<Site, string>> {
    try {
      const result = await this.siteRepository.associateCertificates(siteId);
      return ok(result.site);
    } catch (error) {
      return err(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
