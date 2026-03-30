import { Manifest } from '@/sdk/domain/entities/manifest';
import { ManifestContent } from '@/sdk/domain/entities/manifest-content';
import { ManifestV1 } from '@/sdk/contracts/manifest/v1/manifest-v1';
import { ManifestContentV1 } from '@/sdk/contracts/manifest/v1/manifest-content-v1';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';

/**
 * DTO mapper for manifest data with version routing
 */
export class ManifestDtoMapper {
  /**
   * Convert contract to domain entity based on apiVersion
   */
  toDomain(contract: any): Manifest {
    switch (contract.apiVersion) {
      case "2025-11-15":
        return this.v1ToDomain(contract as ManifestV1);
      default:
        throw new WaldeUnexpectedError(`Unsupported manifest API version: ${contract.apiVersion}`, new Error('Unsupported API version'));
    }
  }

  /**
   * Convert domain entity to V1 contract
   */
  domainToV1(manifest: Manifest): ManifestV1 {
    return {
      apiVersion: "2025-11-15",
      contents: manifest.contents.map(content => this.manifestContentToV1(content))
    };
  }

  /**
   * Convert V1 contract to domain entity
   */
  private v1ToDomain(contract: ManifestV1): Manifest {
    const contents = contract.contents.map(contentContract => 
      new ManifestContent(
        contentContract.id,
        contentContract.name,
        contentContract.key,
        contentContract.format,
        contentContract.locales
      )
    );

    return new Manifest(contents);
  }

  /**
   * Convert ManifestContent domain entity to V1 contract
   */
  private manifestContentToV1(content: ManifestContent): ManifestContentV1 {
    return {
      apiVersion: "2025-11-15",
      id: content.id,
      name: content.name,
      key: content.key,
      format: content.format,
      locales: content.locales
    };
  }
}
