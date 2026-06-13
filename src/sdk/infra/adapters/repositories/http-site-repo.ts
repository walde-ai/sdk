import { SiteRepository, CertificateAssociationsResult, CertificateAssociation } from '@/sdk/domain/ports/out/site-repository';
import { Site, SiteState, CustomDomain } from '@/sdk/domain/entities';
import { ApiClient } from '@/sdk/infra/adapters/api-client';
import { type Option, some, none } from '@/std';

interface SiteListResponse {
  sites: SiteApiData[];
}

interface SiteApiData {
  id: string;
  name: string;
  state: SiteState;
  region?: string;
  url: string | null;
  customDomains?: CustomDomain[];
  createdAt?: string | null;
}

interface AssociateCertificatesApiResponse extends SiteApiData {
  certificateAssociations: Record<string, CertificateAssociation>;
}

export class HttpSiteRepository implements SiteRepository {
  private static readonly BASE_PATH = '/v1/sites';

  public constructor(private readonly apiClient: ApiClient) {}

  public async getAll(): Promise<Site[]> {
    const response = await this.apiClient.get<SiteListResponse>(HttpSiteRepository.BASE_PATH);
    const sites = response.sites;
    return sites.map((siteData: SiteApiData) => {
      return this.mapSiteData(siteData);
    });
  }

  public async get(siteId: string): Promise<Site> {
    const siteData = await this.apiClient.get<SiteApiData>(`${HttpSiteRepository.BASE_PATH}/${siteId}`);
    return this.mapSiteData(siteData);
  }

  public async save(site: Site): Promise<Site> {
    const payload: Record<string, unknown> = {
      state: site.state
    };

    if (site.state !== SiteState.DELETE_REQUESTED) {
      payload.name = site.name;
    }

    if (site.region !== undefined) {
      payload.region = site.region;
    }

    const path = site.id ? `${HttpSiteRepository.BASE_PATH}/${site.id}` : HttpSiteRepository.BASE_PATH;
    const siteData = await this.apiClient.post<SiteApiData>(path, payload);
    return this.mapSiteData(siteData);
  }

  public async addCustomDomain(siteId: string, domain: string): Promise<Site> {
    const siteData = await this.apiClient.post<SiteApiData>(
      `${HttpSiteRepository.BASE_PATH}/${siteId}/add-custom-domain`,
      { domain }
    );
    return this.mapSiteData(siteData);
  }

  public async associateCertificates(siteId: string): Promise<CertificateAssociationsResult> {
    const responseData = await this.apiClient.post<AssociateCertificatesApiResponse>(
      `${HttpSiteRepository.BASE_PATH}/${siteId}/associate-certificates`,
      {}
    );
    return {
      site: this.mapSiteData(responseData),
      certificateAssociations: responseData.certificateAssociations,
    };
  }

  private mapSiteData(siteData: SiteApiData): Site {
    const url: Option<string> = siteData.url ? some(siteData.url) : none();
    return new Site(
      siteData.id,
      siteData.name,
      siteData.state,
      siteData.region,
      url,
      siteData.customDomains ?? [],
      siteData.createdAt ?? null
    );
  }
}
