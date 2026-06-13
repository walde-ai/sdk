import { FrontendContent, ContentFormat, ContentPart, FormatPart, MarkdownPart, KeyValuePart, StringPart } from '@/sdk/domain/entities';
import { FrontendContentV1 } from '@/sdk/contracts/frontend-content/v1/frontend-content-v1';
import { ContentFormatV1 } from '@/sdk/contracts/frontend-content/v1/content-format-v1';
import { ContentPartV1 } from '@/sdk/contracts/frontend-content/v1/content-part-v1';
import { WaldeUnexpectedError } from '@/sdk/domain/errors';

/**
 * DTO mapper for frontend content data with version routing
 */
export class FrontendContentDtoMapper {
  /**
   * Convert contract to domain entity based on apiVersion
   */
  toDomain(contract: any): FrontendContent {
    switch (contract.apiVersion) {
      case "2025-11-15":
        return this.v1ToDomain(contract as FrontendContentV1);
      default:
        throw new WaldeUnexpectedError(`Unsupported frontend content API version: ${contract.apiVersion}`, new Error('Unsupported API version'));
    }
  }

  /**
   * Convert domain entity to V1 contract
   */
  domainToV1(content: FrontendContent): FrontendContentV1 {
    const partsV1: Record<string, ContentPartV1> = {};
    for (const [key, part] of Object.entries(content.parts)) {
      partsV1[key] = {
        data: part.data,
        format: part.format
      };
    }

    return {
      apiVersion: "2025-11-15",
      name: content.name,
      key: content.key,
      format: {
        id: content.format.id,
        name: content.format.name
      },
      parts: partsV1
    };
  }

  /**
   * Convert V1 contract to domain entity
   */
  private v1ToDomain(contract: FrontendContentV1): FrontendContent {
    const format = new ContentFormat(
      contract.format.id,
      contract.format.name
    );

    const parts: Record<string, ContentPart> = {};
    for (const [key, partContract] of Object.entries(contract.parts)) {
      parts[key] = new ContentPart(
        this.toFormatPart(partContract.format),
        partContract.data
      );
    }

    return new FrontendContent(
      contract.name,
      contract.key,
      format,
      parts
    );
  }

  private toFormatPart(format: string): FormatPart {
    switch (format) {
      case 'markdown':
        return new MarkdownPart();
      case 'keyvalue':
        return new KeyValuePart();
      case 'string':
        return new StringPart();
      default:
        throw new WaldeUnexpectedError(
          `Unsupported content part format: ${format}`,
          new Error('Unsupported format')
        );
    }
  }
}
