import { IWSSession, IWSProtocol, ProtocolV20260411Operations } from '@walde.ai/ws-protocol';
import { IWebSocketClient } from '@/sdk/domain/ports/in/web-socket-client';

export class WSClientSession implements IWSSession<ProtocolV20260411Operations> {
  private readonly client: IWebSocketClient;
  private readonly protocol: IWSProtocol<ProtocolV20260411Operations>;

  constructor(params: { client: IWebSocketClient; protocol: IWSProtocol<ProtocolV20260411Operations> }) {
    this.client = params.client;
    this.protocol = params.protocol;
  }

  async send<K extends keyof ProtocolV20260411Operations>(op: K, data: ProtocolV20260411Operations[K]): Promise<void> {
    const encoded = this.protocol.encode(op, data);
    this.client.send(encoded);
  }

  close(): void {
    this.client.close();
  }
}
