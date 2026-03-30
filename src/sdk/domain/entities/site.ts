export enum SiteState {
  UPDATED = 'UPDATED',
  UPDATE_REQUESTED = 'UPDATE_REQUESTED',
  DELETE_REQUESTED = 'DELETE_REQUESTED',
  DELETED = 'DELETED',
  ERROR = 'ERROR'
}

export enum CustomDomainStatus {
  PROVISIONING = 'PROVISIONING',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  VERIFIED = 'VERIFIED'
}

export type DnsEntryRole = 'ui-cdn-pointer' | 'ui-certificate-validation';

export interface DnsEntryRequirement {
  entry: string;
  type: string;
  value: string;
  role: DnsEntryRole;
}

export interface CustomDomain {
  domain: string;
  status: CustomDomainStatus;
  requiredDnsEntries: DnsEntryRequirement[];
}

/**
 * Represents a website with its configuration
 */
export class Site {
  public constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly state: SiteState,
    public readonly region?: string,
    public readonly url: string | null = null,
    public readonly customDomains: CustomDomain[] = [],
    public readonly createdAt: string | null = null
  ) {}
}
