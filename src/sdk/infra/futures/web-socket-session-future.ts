import { Future, Result, ok, err } from '@/std';
import { IWebSocketClientFactory } from '@/sdk/domain/ports/in/web-socket-client-factory';
import { TokenProvider } from '@/sdk/domain/ports/in/token-provider';
import { IWaldeWSSession } from '@/sdk/domain/ports/in/walde-ws-session';
import { WebSocketConnect } from '@/sdk/domain/interactors/ws-connect';
import { WSProtocolV20260411, IWSOperationListener, IWSSession, ProtocolV20260411Operations, ChatSendData, ChatStreamData, ChatStreamEndData, ChatCreatedData, ChatReadyData, ChatStatusData, ChatTerminatedData, ChatAbortAckData, TaskStartedData, TaskCancelledData, TaskCompletedData, TaskFailedData, BriefUpdatedData, UiNavData, ErrorData, WS_PROTOCOL_V20260411_NAME } from '@walde.ai/ws-protocol';
import { WSClientSession } from '../sessions/ws-client-session';
import { WaldeWSSession } from '../sessions/walde-ws-session';
import type { WaldeAdmin } from './walde-admin-future';

interface WebSocketSessionFutureConfig {
  parent: WaldeAdmin;
  wsEndpoint: string;
  tokenProvider: TokenProvider;
  webSocketClientFactory: IWebSocketClientFactory;
  chatMessageCallback: ((data: ChatSendData) => void) | undefined;
  chatStreamCallback: ((data: ChatStreamData) => void) | undefined;
  chatStreamEndCallback: ((data: ChatStreamEndData) => void) | undefined;
  chatCreatedCallback: ((data: ChatCreatedData) => void) | undefined;
  chatReadyCallback: ((data: ChatReadyData) => void) | undefined;
  chatStatusCallback: ((data: ChatStatusData) => void) | undefined;
  chatTerminatedCallback: ((data: ChatTerminatedData) => void) | undefined;
  chatAbortAckCallback: ((data: ChatAbortAckData) => void) | undefined;
  taskStartedCallback: ((data: TaskStartedData) => void) | undefined;
  taskCancelledCallback: ((data: TaskCancelledData) => void) | undefined;
  taskCompletedCallback: ((data: TaskCompletedData) => void) | undefined;
  taskFailedCallback: ((data: TaskFailedData) => void) | undefined;
  briefUpdatedCallback: ((data: BriefUpdatedData) => void) | undefined;
  uiNavCallback: ((data: UiNavData) => void) | undefined;
  errorCallback: ((data: ErrorData) => void) | undefined;
}

class CallbackOperationListener<T> implements IWSOperationListener<T, ProtocolV20260411Operations> {
  private readonly callback: (data: T) => void;

  constructor(callback: (data: T) => void) {
    this.callback = callback;
  }

  async handle(params: { session: IWSSession<ProtocolV20260411Operations>; data: T }): Promise<void> {
    this.callback(params.data);
  }
}

export class WebSocketSessionFuture extends Future<IWaldeWSSession, WaldeAdmin> {
  private readonly wsEndpoint: string;
  private readonly tokenProvider: TokenProvider;
  private readonly webSocketClientFactory: IWebSocketClientFactory;
  private readonly chatMessageCallback: ((data: ChatSendData) => void) | undefined;
  private readonly chatStreamCallback: ((data: ChatStreamData) => void) | undefined;
  private readonly chatStreamEndCallback: ((data: ChatStreamEndData) => void) | undefined;
  private readonly chatCreatedCallback: ((data: ChatCreatedData) => void) | undefined;
  private readonly chatReadyCallback: ((data: ChatReadyData) => void) | undefined;
  private readonly chatStatusCallback: ((data: ChatStatusData) => void) | undefined;
  private readonly chatTerminatedCallback: ((data: ChatTerminatedData) => void) | undefined;
  private readonly chatAbortAckCallback: ((data: ChatAbortAckData) => void) | undefined;
  private readonly taskStartedCallback: ((data: TaskStartedData) => void) | undefined;
  private readonly taskCancelledCallback: ((data: TaskCancelledData) => void) | undefined;
  private readonly taskCompletedCallback: ((data: TaskCompletedData) => void) | undefined;
  private readonly taskFailedCallback: ((data: TaskFailedData) => void) | undefined;
  private readonly briefUpdatedCallback: ((data: BriefUpdatedData) => void) | undefined;
  private readonly uiNavCallback: ((data: UiNavData) => void) | undefined;
  private readonly errorCallback: ((data: ErrorData) => void) | undefined;

  constructor(config: WebSocketSessionFutureConfig) {
    super({ parent: config.parent });
    this.wsEndpoint = config.wsEndpoint;
    this.tokenProvider = config.tokenProvider;
    this.webSocketClientFactory = config.webSocketClientFactory;
    this.chatMessageCallback = config.chatMessageCallback;
    this.chatStreamCallback = config.chatStreamCallback;
    this.chatStreamEndCallback = config.chatStreamEndCallback;
    this.chatCreatedCallback = config.chatCreatedCallback;
    this.chatReadyCallback = config.chatReadyCallback;
    this.chatStatusCallback = config.chatStatusCallback;
    this.chatTerminatedCallback = config.chatTerminatedCallback;
    this.chatAbortAckCallback = config.chatAbortAckCallback;
    this.taskStartedCallback = config.taskStartedCallback;
    this.taskCancelledCallback = config.taskCancelledCallback;
    this.taskCompletedCallback = config.taskCompletedCallback;
    this.taskFailedCallback = config.taskFailedCallback;
    this.briefUpdatedCallback = config.briefUpdatedCallback;
    this.uiNavCallback = config.uiNavCallback;
    this.errorCallback = config.errorCallback;
  }

  async resolve(): Promise<Result<IWaldeWSSession, string>> {
    const listeners: Partial<{
      'chat.send': IWSOperationListener<ChatSendData, ProtocolV20260411Operations>;
      'chat.stream': IWSOperationListener<ChatStreamData, ProtocolV20260411Operations>;
      'chat.stream_end': IWSOperationListener<ChatStreamEndData, ProtocolV20260411Operations>;
      'chat.created': IWSOperationListener<ChatCreatedData, ProtocolV20260411Operations>;
      'chat.ready': IWSOperationListener<ChatReadyData, ProtocolV20260411Operations>;
      'chat.status': IWSOperationListener<ChatStatusData, ProtocolV20260411Operations>;
      'chat.terminated': IWSOperationListener<ChatTerminatedData, ProtocolV20260411Operations>;
      'chat.abort_ack': IWSOperationListener<ChatAbortAckData, ProtocolV20260411Operations>;
      'task.started': IWSOperationListener<TaskStartedData, ProtocolV20260411Operations>;
      'task.cancelled': IWSOperationListener<TaskCancelledData, ProtocolV20260411Operations>;
      'task.completed': IWSOperationListener<TaskCompletedData, ProtocolV20260411Operations>;
      'task.failed': IWSOperationListener<TaskFailedData, ProtocolV20260411Operations>;
      'brief.updated': IWSOperationListener<BriefUpdatedData, ProtocolV20260411Operations>;
      'ui.nav': IWSOperationListener<UiNavData, ProtocolV20260411Operations>;
      'error': IWSOperationListener<ErrorData, ProtocolV20260411Operations>;
    }> = {};

    if (this.chatMessageCallback) {
      listeners['chat.send'] = new CallbackOperationListener(this.chatMessageCallback);
    }
    if (this.chatStreamCallback) {
      listeners['chat.stream'] = new CallbackOperationListener(this.chatStreamCallback);
    }
    if (this.chatStreamEndCallback) {
      listeners['chat.stream_end'] = new CallbackOperationListener(this.chatStreamEndCallback);
    }
    if (this.chatCreatedCallback) {
      listeners['chat.created'] = new CallbackOperationListener(this.chatCreatedCallback);
    }
    if (this.chatReadyCallback) {
      listeners['chat.ready'] = new CallbackOperationListener(this.chatReadyCallback);
    }
    if (this.chatStatusCallback) {
      listeners['chat.status'] = new CallbackOperationListener(this.chatStatusCallback);
    }
    if (this.chatTerminatedCallback) {
      listeners['chat.terminated'] = new CallbackOperationListener(this.chatTerminatedCallback);
    }
    if (this.chatAbortAckCallback) {
      listeners['chat.abort_ack'] = new CallbackOperationListener(this.chatAbortAckCallback);
    }
    if (this.taskStartedCallback) {
      listeners['task.started'] = new CallbackOperationListener(this.taskStartedCallback);
    }
    if (this.taskCancelledCallback) {
      listeners['task.cancelled'] = new CallbackOperationListener(this.taskCancelledCallback);
    }
    if (this.taskCompletedCallback) {
      listeners['task.completed'] = new CallbackOperationListener(this.taskCompletedCallback);
    }
    if (this.taskFailedCallback) {
      listeners['task.failed'] = new CallbackOperationListener(this.taskFailedCallback);
    }
    if (this.briefUpdatedCallback) {
      listeners['brief.updated'] = new CallbackOperationListener(this.briefUpdatedCallback);
    }
    if (this.uiNavCallback) {
      listeners['ui.nav'] = new CallbackOperationListener(this.uiNavCallback);
    }
    if (this.errorCallback) {
      listeners['error'] = new CallbackOperationListener(this.errorCallback);
    }

    const protocol = new WSProtocolV20260411({ listeners, mode: 'client' });

    const interactor = new WebSocketConnect({
      wsEndpoint: this.wsEndpoint,
      tokenProvider: this.tokenProvider,
      webSocketClientFactory: this.webSocketClientFactory,
      protocolName: WS_PROTOCOL_V20260411_NAME,
    });

    try {
      const client = await interactor.execute();
      const clientSession = new WSClientSession({ client, protocol });

      client.onMessage((raw) => {
        void (async (): Promise<void> => {
          try {
            await protocol.handleMessage(raw, clientSession);
          } catch (error) {
            console.error('Unhandled WebSocket message processing error', error);
          }
        })();
      });

      const waldeSession = new WaldeWSSession({ session: clientSession });
      return ok(waldeSession);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'WebSocket connection failed';
      return err(message);
    }
  }
}
