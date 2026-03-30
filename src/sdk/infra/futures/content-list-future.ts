import { Future } from '@/std/domain/entities/future';
import { Result, ok, err } from '@/std/domain/entities/result';
import { ManifestContent } from '@/sdk/domain/entities/manifest-content';
import { ManifestFuture } from './manifest-future';

/**
 * Future for content list operations from manifest
 */
export class ContentListFuture extends Future<ManifestContent[], never> {
  constructor(private readonly manifestFuture: ManifestFuture) {
    super({ parent: undefined as never });
  }

  /**
   * Resolve the list of content metadata from manifest
   */
  async resolve(): Promise<Result<ManifestContent[], any>> {
    try {
      const manifestResult = await this.manifestFuture.resolve();
      if (manifestResult.isErr()) {
        return err(manifestResult.unwrapErr());
      }
      
      const manifest = manifestResult.unwrap();
      return ok(manifest.contents);
    } catch (error) {
      return err(error);
    }
  }
}
