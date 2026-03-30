import { WaldeAdminConfigData, PartialWaldeAdminConfigData, WaldeAdminConfig } from '@/sdk/domain/entities/walde-admin-config';
import { StaticWaldeAdminConfig } from '@/sdk/infra/adapters/repositories/static-walde-admin-config';
import { FileWaldeAdminConfig } from '@/sdk/infra/adapters/repositories/file-walde-admin-config';
import { DefaultWaldeAdminConfig } from '@/sdk/infra/adapters/repositories/default-walde-admin-config';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

/**
 * Factory for creating complete Walde configuration
 */
export class WaldeAdminConfigFactory {
  private static migrationCompleted = false;

  /**
   * Perform one-time migration from ~/.writer/ to ~/.walde/
   */
  private static performMigration(): void {
    if (this.migrationCompleted) return;

    const homeDir = os.homedir();
    const oldWriterDir = path.join(homeDir, '.writer');
    const newWaldeDir = path.join(homeDir, '.walde');

    if (fs.existsSync(oldWriterDir) && !fs.existsSync(newWaldeDir)) {
      try {
        fs.mkdirSync(newWaldeDir, { recursive: true });

        // Migrate settings.json to walde.json
        const oldSettingsPath = path.join(oldWriterDir, 'settings.json');
        const newWaldePath = path.join(newWaldeDir, 'walde.json');
        if (fs.existsSync(oldSettingsPath)) {
          fs.copyFileSync(oldSettingsPath, newWaldePath);
        }

        // Migrate credentials.json
        const oldCredentialsPath = path.join(oldWriterDir, 'credentials.json');
        const newCredentialsPath = path.join(newWaldeDir, 'credentials.json');
        if (fs.existsSync(oldCredentialsPath)) {
          fs.copyFileSync(oldCredentialsPath, newCredentialsPath);
        }

        console.log('✅ Migrated configuration from ~/.writer/ to ~/.walde/');
      } catch (error) {
        console.warn('⚠️  Migration from ~/.writer/ to ~/.walde/ failed. Please migrate manually.');
      }
    }

    this.migrationCompleted = true;
  }

  /**
   * Get global config from ~/.walde/walde[.stage].json
   */
  private static getHomeConfig(stage?: string): FileWaldeAdminConfig {
    this.performMigration();
    const homeDir = os.homedir();
    const fileName = stage ? `walde.${stage}.json` : 'walde.json';
    const globalWaldeAdminConfigPath = path.join(homeDir, '.walde', fileName);
    return new FileWaldeAdminConfig(globalWaldeAdminConfigPath);
  }

  /**
   * Get workspace config from walde[.stage].json starting from cwd and going up
   */
  private static getWorkspaceConfig(stage?: string): WaldeAdminConfig {
    let currentDir = process.cwd();
    const fileName = stage ? `walde.${stage}.json` : 'walde.json';
    
    while (currentDir !== path.dirname(currentDir)) {
      const waldeConfigPath = path.join(currentDir, fileName);
      const candidate = new FileWaldeAdminConfig(waldeConfigPath);
      const data = candidate.getData();
      if (data.endpoint || data.clientId || data.region) {
        return candidate;
      }
      currentDir = path.dirname(currentDir);
    }
    return new StaticWaldeAdminConfig();
  }

  /**
   * Load and merge configuration from all sources with stage support
   */
  public static create(providedConfig: PartialWaldeAdminConfigData = {}, stage?: string): WaldeAdminConfigData {
    // Merge configs: provided > workspace > home > default
    let finalConfig = (new StaticWaldeAdminConfig(providedConfig))
      .merge(this.getWorkspaceConfig(stage))
      .merge(this.getHomeConfig(stage))
      .merge(DefaultWaldeAdminConfig.create());

    // If stage is specified and config is incomplete, fallback to default files
    if (stage) {
      const stageConfigResult = finalConfig.promote();
      if (stageConfigResult.isErr()) {
        finalConfig = finalConfig
          .merge(this.getWorkspaceConfig())
          .merge(this.getHomeConfig())
          .merge(DefaultWaldeAdminConfig.create());
      }
    }

    // Promote to complete configuration
    const completeConfigResult = finalConfig.promote();
    if (completeConfigResult.isErr()) {
      throw new WaldeUnexpectedError(completeConfigResult.unwrapErr(), new Error('Config promotion failed'));
    }

    return completeConfigResult.unwrap();
  }
}
