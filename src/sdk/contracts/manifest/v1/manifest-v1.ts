import { ManifestContentV1 } from './manifest-content-v1';

/**
 * V1 contract for manifest data structure
 */
export interface ManifestV1 {
  apiVersion: "2025-11-15";
  contents: ManifestContentV1[];
}
