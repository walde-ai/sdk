export interface IWebSocketClient {
  onOpen(callback: () => void): void;
  onMessage(callback: (data: string) => void): void;
  onError(callback: (error: Error) => void): void;
  onClose(callback: (code: number, reason: string) => void): void;
  send(data: string): void;
  close(): void;
  readyState: number;
}
