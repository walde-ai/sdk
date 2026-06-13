import { WaldeApi } from '@/sdk/domain/entities/api';

export interface LambdaProxyResult {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

interface LambdaProxyLikeEvent {
  body?: string | null;
}

interface WaldeEnvelope<T> {
  metadata: Record<string, unknown>;
  payload: T;
}

function successEnvelope<T>(payload: T): WaldeEnvelope<T> {
  return { payload, metadata: {} };
}

function errorEnvelope(message: string): WaldeEnvelope<Record<string, never>> {
  return { payload: {}, metadata: { error: message } };
}

export class WaldeApiHandler<TInput = unknown, TOutput = unknown> {
  constructor(private readonly api: WaldeApi<TInput, TOutput>) {}

  async handle(rawEvent: unknown): Promise<LambdaProxyResult> {
    const event = rawEvent as LambdaProxyLikeEvent;
    const rawBody = event?.body;

    let payload: TInput;

    if (rawBody === undefined || rawBody === null || rawBody === '') {
      payload = undefined as TInput;
    } else {
      if (typeof rawBody !== 'string') {
        return {
          statusCode: 400,
          body: JSON.stringify(errorEnvelope('Invalid JSON body')),
        };
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawBody);
      } catch {
        return {
          statusCode: 400,
          body: JSON.stringify(errorEnvelope('Invalid JSON body')),
        };
      }

      payload = (parsed as { payload?: unknown }).payload as TInput;
    }

    try {
      const output = await this.api.handler(payload);
      return {
        statusCode: 200,
        body: JSON.stringify(successEnvelope(output)),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        statusCode: 500,
        body: JSON.stringify(errorEnvelope(message)),
      };
    }
  }
}
