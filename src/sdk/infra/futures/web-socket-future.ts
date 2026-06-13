import { Future, Result, ok, err } from '@/std';

import { IWebSocketClient } from '@/sdk/domain/ports/in/web-socket-client';
import { IWebSocketClientFactory } from '@/sdk/domain/ports/in/web-socket-client-factory';
import { TokenProvider } from '@/sdk/domain/ports/in/token-provider';
import { WebSocketConnect } from '@/sdk/domain/interactors/ws-connect';
import type { WaldeAdmin } from './walde-admin-future';
import { WS_PROTOCOL_V20260411_NAME } from '@walde.ai/ws-protocol';
import { WSSessionBuilder } from './ws-session-builder';

interface WebSocketFutureConfig {
  parent: WaldeAdmin;
  wsEndpoint: string;
  tokenProvider: TokenProvider;
  webSocketClientFactory: IWebSocketClientFactory;
}

export class WebSocketFuture extends Future<IWebSocketClient, WaldeAdmin> {
  private readonly wsEndpoint: string;
  private readonly tokenProvider: TokenProvider;
  private readonly webSocketClientFactory: IWebSocketClientFactory;

  constructor(config: WebSocketFutureConfig) {
    super({ parent: config.parent });
    this.wsEndpoint = config.wsEndpoint;
    this.tokenProvider = config.tokenProvider;
    this.webSocketClientFactory = config.webSocketClientFactory;
  }

  raw(): WebSocketFuture {
    return new WebSocketFuture({
      parent: this.parent,
      wsEndpoint: this.wsEndpoint,
      tokenProvider: this.tokenProvider,
      webSocketClientFactory: this.webSocketClientFactory,
    });
  }

  session(): WSSessionBuilder {
    return new WSSessionBuilder({
      parent: this.parent,
      wsEndpoint: this.wsEndpoint,
      tokenProvider: this.tokenProvider,
      webSocketClientFactory: this.webSocketClientFactory,
    });
  }

  async resolve(): Promise<Result<IWebSocketClient, string>> {
    const interactor = new WebSocketConnect({
      wsEndpoint: this.wsEndpoint,
      tokenProvider: this.tokenProvider,
      webSocketClientFactory: this.webSocketClientFactory,
      protocolName: WS_PROTOCOL_V20260411_NAME,
    });

    try {
      const client = await interactor.execute();
      return ok(client);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'WebSocket connection failed';
      return err(message);
    }
  }
}
