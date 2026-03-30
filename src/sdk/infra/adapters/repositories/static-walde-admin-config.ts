import { WaldeAdminConfig, PartialWaldeAdminConfigData } from '@/sdk/domain/entities/walde-admin-config';

/**
 * Static configuration implementation
 */
export class StaticWaldeAdminConfig extends WaldeAdminConfig {
  constructor(data: PartialWaldeAdminConfigData = {}) {
    super(data);
  }

  protected createInstance(data: PartialWaldeAdminConfigData): StaticWaldeAdminConfig {
    return new StaticWaldeAdminConfig(data);
  }
}
