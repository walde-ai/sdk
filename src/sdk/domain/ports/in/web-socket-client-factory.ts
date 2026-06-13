import { IWebSocketClient } from './web-socket-client';

export interface IWebSocketClientFactory {
  create(url: string, protocols: string[]): IWebSocketClient;
}
