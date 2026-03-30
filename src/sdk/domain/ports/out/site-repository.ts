import { Site } from '@/sdk/domain/entities/site';

/**
 * Certificate association result
 */
export interface CertificateAssociation {
  associated: boolean;
  reason: string;
}

/**
 * Certificate associations response
 */
export interface CertificateAssociationsResult {
  site: Site;
  certificateAssociations: Record<string, CertificateAssociation>;
}

/**
 * Repository interface for site data access
 */
export interface SiteRepository {
  /**
   * Retrieves all sites for the authenticated user
   */
  getAll(): Promise<Site[]>;

  /**
   * Retrieves a single site by ID
   */
  get(siteId: string): Promise<Site>;

  /**
   * Creates or updates a site
   * If site.id is empty, creates new site (POST /v1/sites)
   * If site.id is provided, updates existing site (POST /v1/sites/<id>)
   */
  save(site: Site): Promise<Site>;

  /**
   * Adds a custom domain to a site
   */
  addCustomDomain(siteId: string, domain: string): Promise<Site>;

  /**
   * Associates validated ACM certificates with CloudFront distributions
   * for custom domains in VERIFICATION_PENDING status.
   */
  associateCertificates(siteId: string): Promise<CertificateAssociationsResult>;
}
