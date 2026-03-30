import { ContentFormatV1 } from './content-format-v1';
import { ContentPartV1 } from './content-part-v1';

/**
 * V1 contract for frontend content data structure
 */
export interface FrontendContentV1 {
  apiVersion: "2025-11-15";
  name: string;
  key: string;
  format: ContentFormatV1;
  parts: Record<string, ContentPartV1>;
}
