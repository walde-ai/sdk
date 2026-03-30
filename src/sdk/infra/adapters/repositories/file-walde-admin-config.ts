import { WaldeAdminConfig, PartialWaldeAdminConfigData } from '@/sdk/domain/entities/walde-admin-config';
import * as fs from 'fs';

/**
 * File-based configuration implementation
 */
export class FileWaldeAdminConfig extends WaldeAdminConfig {
  private filePath: string;

  constructor(filePath: string) {
    super();
    this.filePath = filePath;
    this.loadFromFile();
  }

  private loadFromFile(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        const configData = JSON.parse(fileContent);
        this.data = {
          endpoint: configData.endpoint,
          clientId: configData.clientId,
          region: configData.region,
          userPoolId: configData.userPoolId
        };
      } catch (error) {
        // File exists but is invalid, keep empty config
        this.data = {};
      }
    }
  }

  protected createInstance(data: PartialWaldeAdminConfigData): FileWaldeAdminConfig {
    // Create a new FileWaldeAdminConfig with the same file path but merged data
    const merged = new FileWaldeAdminConfig(this.filePath);
    merged.data = data;
    return merged;
  }
}
