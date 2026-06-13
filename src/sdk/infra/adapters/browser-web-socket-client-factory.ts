import { IWebSocketClient } from '@/sdk/domain/ports/in/web-socket-client';
import { IWebSocketClientFactory } from '@/sdk/domain/ports/in/web-socket-client-factory';

class BrowserWebSocketClient implements IWebSocketClient {
  private readonly ws: globalThis.WebSocket;

  constructor(url: string, protocols: string[]) {
    this.ws = new globalThis.WebSocket(url, protocols);
  }

  get readyState(): number {
    return this.ws.readyState;
  }

  onOpen(callback: () => void): void {
    this.ws.addEventListener('open', () => callback());
  }

  onMessage(callback: (data: string) => void): void {
    this.ws.addEventListener('message', (event) => {
      callback(typeof event.data === 'string' ? event.data : String(event.data));
    });
  }

  onError(callback: (error: Error) => void): void {
    this.ws.addEventListener('error', () => {
      callback(new Error('WebSocket error'));
    });
  }

  onClose(callback: (code: number, reason: string) => void): void {
    this.ws.addEventListener('close', (event) => {
      callback(event.code, event.reason);
    });
  }

  send(data: string): void {
    this.ws.send(data);
  }

  close(): void {
    this.ws.close();
  }
}

export class BrowserWebSocketClientFactory implements IWebSocketClientFactory {
  create(url: string, protocols: string[]): IWebSocketClient {
    return new BrowserWebSocketClient(url, protocols);
  }
}
