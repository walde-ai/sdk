import { WaldeNetworkError } from '@/sdk/domain/errors';
import { FrontendHttpClient } from '@/sdk/infra/adapters/frontend-http-client';
import { Future, Result, err, ok } from '@/std';
import { WaldeApiRegistry } from '@/sdk/domain/entities/api';

/**
 * Mapped type over WaldeApiRegistry. For each registered key K, exposes a
 * method accepting the registered input type and returning a
 * CloudApiCallFuture<TOutput>.
 *
 * When WaldeApiRegistry is empty (no APIs registered), this type is `{}`.
 */
export type CloudApiFuture = {
  [K in keyof WaldeApiRegistry]: [WaldeApiRegistry[K]['input']] extends [undefined]
    ? (input?: WaldeApiRegistry[K]['input']) => CloudApiCallFuture<WaldeApiRegistry[K]['output']>
    : (input: WaldeApiRegistry[K]['input']) => CloudApiCallFuture<WaldeApiRegistry[K]['output']>;
};

interface CloudApiResponse<TOutput> {
  payload: TOutput;
  metadata: Record<string, unknown>;
}

function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function readMetadataError(response: unknown): string | undefined {
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  const metadata = (response as { metadata?: unknown }).metadata;
  if (!metadata || typeof metadata !== 'object') {
    return undefined;
  }

  const error = (metadata as { error?: unknown }).error;
  return typeof error === 'string' ? error : undefined;
}

/**
 * Future for a single cloud API call.
 */
export class CloudApiCallFuture<TOutput> extends Future<TOutput, never> {
  constructor(
    private readonly httpClient: FrontendHttpClient,
    private readonly apiName: string,
    private readonly input: unknown,
    private readonly useGet: boolean
  ) {
    super({ parent: undefined as never });
  }

  async resolve(): Promise<Result<TOutput, string>> {
    try {
      const endpoint = `/_walde/api/${toKebabCase(this.apiName)}`;
      const response =
        this.useGet
          ? await this.httpClient.get<CloudApiResponse<TOutput>>(endpoint)
          : await this.httpClient.post<CloudApiResponse<TOutput>>(endpoint, this.input);
      const metadataError = readMetadataError(response);
      if (metadataError) {
        return err(metadataError);
      }
      if (response && typeof response === 'object' && 'payload' in response) {
        return ok(response.payload);
      }
      return err('Invalid cloud API response: missing payload');
    } catch (error) {
      if (error instanceof WaldeNetworkError) {
        const details = error.details;
        const response = details?.response;
        const metadataError = readMetadataError(response);
        if (metadataError) {
          return err(metadataError);
        }
        return err(error.message);
      }
      return err(error instanceof Error ? error.message : String(error));
    }
  }
}

/**
 * Creates the Proxy-backed runtime object that satisfies the CloudApiFuture
 * mapped type without generating a concrete method per registered API.
 *
 * Any property access returns a function that, when called, returns a
 * CloudApiCallFuture instance.
 */
export function createCloudApiFuture(httpClient: FrontendHttpClient): CloudApiFuture {
  return new Proxy({} as CloudApiFuture, {
    get(_target, prop) {
      if (typeof prop !== 'string') {
        return undefined;
      }
      return (...args: unknown[]): CloudApiCallFuture<unknown> => {
        const useGet = args.length === 0;
        const input = useGet ? undefined : args[0];
        return new CloudApiCallFuture<unknown>(httpClient, prop, input, useGet);
      };
    },
  });
}

/**
 * Lightweight intermediary grouping cloud-related operations under a single
 * namespace on WaldeFuture. Exposes api() which returns a CloudApiFuture.
 */
export class CloudFuture extends Future<CloudFuture, never> {
  constructor(private readonly httpClient: FrontendHttpClient) {
    super({ parent: undefined as never });
  }

  api(): CloudApiFuture {
    return createCloudApiFuture(this.httpClient);
  }

  async resolve(): Promise<Result<CloudFuture, never>> {
    return ok(this);
  }
}
