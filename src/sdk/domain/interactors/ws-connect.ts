import { IWebSocketClient } from '@/sdk/domain/ports/in/web-socket-client';
import { IWebSocketClientFactory } from '@/sdk/domain/ports/in/web-socket-client-factory';
import { TokenProvider } from '@/sdk/domain/ports/in/token-provider';

export interface WebSocketConnectInput {
  wsEndpoint: string;
  tokenProvider: TokenProvider;
  webSocketClientFactory: IWebSocketClientFactory;
  protocolName: string;
}

export class WebSocketConnect {
  private readonly wsEndpoint: string;
  private readonly tokenProvider: TokenProvider;
  private readonly webSocketClientFactory: IWebSocketClientFactory;
  private readonly protocolName: string;

  constructor(input: WebSocketConnectInput) {
    this.wsEndpoint = input.wsEndpoint;
    this.tokenProvider = input.tokenProvider;
    this.webSocketClientFactory = input.webSocketClientFactory;
    this.protocolName = input.protocolName;
  }

  async execute(): Promise<IWebSocketClient> {
    const token = await this.tokenProvider.getAccessToken();
    const url = new URL(this.wsEndpoint);
    url.searchParams.set('token', token);

    return await new Promise<IWebSocketClient>((resolve, reject) => {
      const client = this.webSocketClientFactory.create(url.toString(), [this.protocolName]);

      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timed out'));
      }, 10_000);

      client.onOpen(() => {
        clearTimeout(timeout);
        resolve(client);
      });

      client.onClose((code, reason) => {
        clearTimeout(timeout);
        reject(new Error(`WebSocket closed before open (${code}): ${reason}`));
      });

      client.onError((error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
}
