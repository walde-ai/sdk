import WebSocket from 'ws';

import { IWebSocketClient } from '@/sdk/domain/ports/in/web-socket-client';
import { IWebSocketClientFactory } from '@/sdk/domain/ports/in/web-socket-client-factory';

class NodeWebSocketClient implements IWebSocketClient {
  private readonly ws: WebSocket;

  constructor(url: string, protocols: string[]) {
    this.ws = new WebSocket(url, protocols);
  }

  get readyState(): number {
    return this.ws.readyState;
  }

  onOpen(callback: () => void): void {
    this.ws.on('open', callback);
  }

  onMessage(callback: (data: string) => void): void {
    this.ws.on('message', (data) => {
      callback(data.toString());
    });
  }

  onError(callback: (error: Error) => void): void {
    this.ws.on('error', callback);
  }

  onClose(callback: (code: number, reason: string) => void): void {
    this.ws.on('close', (code, reason) => {
      callback(code, reason.toString());
    });
  }

  send(data: string): void {
    this.ws.send(data);
  }

  close(): void {
    this.ws.close();
  }
}

export class NodeWebSocketClientFactory implements IWebSocketClientFactory {
  create(url: string, protocols: string[]): IWebSocketClient {
    return new NodeWebSocketClient(url, protocols);
  }
}
