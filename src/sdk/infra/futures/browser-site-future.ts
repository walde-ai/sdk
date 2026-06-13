import { Future, Result, ok, err } from '@/std';
import { Site, SiteState } from '@/sdk/domain/entities';
import { SiteRepository } from '@/sdk/domain/ports/out/site-repository';
import { WaldeConfigurationError } from '@/sdk/domain/errors';

const DEFAULT_READY_TIMEOUT_MS = 10 * 60 * 1000;
const INITIAL_POLL_INTERVAL_MS = 500;
const MAX_POLL_INTERVAL_MS = 5000;

type SiteOperation = 'get' | 'ready';

export class BrowserSiteFuture extends Future<Site, never> {
  private operation: SiteOperation | null = null;
  private readonly siteId: string;
  private readyTimeoutMs: number = DEFAULT_READY_TIMEOUT_MS;

  constructor(
    private readonly sitesRepo: SiteRepository,
    siteId: string,
  ) {
    super({ parent: undefined as never });
    this.siteId = siteId;
  }

  get(): BrowserSiteFuture {
    const future = new BrowserSiteFuture(this.sitesRepo, this.siteId);
    future.operation = 'get';
    return future;
  }

  ready(params?: { timeoutMs?: number }): BrowserSiteFuture {
    const future = new BrowserSiteFuture(this.sitesRepo, this.siteId);
    future.operation = 'ready';
    future.readyTimeoutMs = params?.timeoutMs ?? DEFAULT_READY_TIMEOUT_MS;
    return future;
  }

  async resolve(): Promise<Result<Site, string>> {
    if (!this.operation) {
      return err('No operation specified');
    }

    if (this.operation === 'get') {
      try {
        const result = await this.sitesRepo.get(this.siteId);
        return ok(result);
      } catch (e: unknown) {
        return err(e instanceof Error ? e.message : String(e));
      }
    }

    if (this.operation === 'ready') {
      return await this.pollUntilReady(this.siteId, this.readyTimeoutMs);
    }

    const _: never = this.operation;
    throw new WaldeConfigurationError(`Unsupported site operation in browser: ${_ as string}`);
  }

  private async pollUntilReady(siteId: string, timeoutMs: number): Promise<Result<Site, string>> {
    const startTime = Date.now();
    let intervalMs = INITIAL_POLL_INTERVAL_MS;

    while (true) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeoutMs) {
        return err('Timed out waiting for site to become ready');
      }

      try {
        const site = await this.sitesRepo.get(siteId);
        if (site.state === SiteState.UPDATED) {
          return ok(site);
        }
        if (site.state === 'ERROR') {
          return err('Site provisioning failed with ERROR state');
        }
      } catch {
        // transient errors during polling are ignored
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      intervalMs = Math.min(intervalMs * 2, MAX_POLL_INTERVAL_MS);
    }
  }
}
