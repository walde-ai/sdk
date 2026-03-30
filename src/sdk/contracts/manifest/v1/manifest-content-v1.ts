/**
 * V1 contract for manifest content metadata
 */
export interface ManifestContentV1 {
  apiVersion: "2025-11-15";
  id: string;
  name: string;
  key: string;
  format: string;
  locales: string[];
}
