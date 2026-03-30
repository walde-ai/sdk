import { ManifestContent } from './manifest-content';

/**
 * Version-agnostic manifest representation containing content metadata
 */
export class Manifest {
  constructor(
    public readonly contents: ManifestContent[]
  ) {}
}
