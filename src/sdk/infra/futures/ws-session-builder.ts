import { IWebSocketClientFactory } from '@/sdk/domain/ports/in/web-socket-client-factory';
import { TokenProvider } from '@/sdk/domain/ports/in/token-provider';
import { ChatSendData, ChatStreamData, ChatStreamEndData, ChatCreatedData, ChatReadyData, ChatStatusData, ChatTerminatedData, ChatAbortAckData, TaskStartedData, TaskCancelledData, TaskCompletedData, TaskFailedData, ErrorData } from '@walde.ai/ws-protocol';
import { WebSocketSessionFuture } from './web-socket-session-future';
import type { WaldeAdmin } from './walde-admin-future';

interface WSSessionBuilderConfig {
  parent: WaldeAdmin;
  wsEndpoint: string;
  tokenProvider: TokenProvider;
  webSocketClientFactory: IWebSocketClientFactory;
}

export class WSSessionBuilder {
  private readonly config: WSSessionBuilderConfig;
  private chatMessageCallback: ((data: ChatSendData) => void) | undefined;
  private chatStreamCallback: ((data: ChatStreamData) => void) | undefined;
  private chatStreamEndCallback: ((data: ChatStreamEndData) => void) | undefined;
  private chatCreatedCallback: ((data: ChatCreatedData) => void) | undefined;
  private chatReadyCallback: ((data: ChatReadyData) => void) | undefined;
  private chatStatusCallback: ((data: ChatStatusData) => void) | undefined;
  private chatTerminatedCallback: ((data: ChatTerminatedData) => void) | undefined;
  private chatAbortAckCallback: ((data: ChatAbortAckData) => void) | undefined;
  private taskStartedCallback: ((data: TaskStartedData) => void) | undefined;
  private taskCancelledCallback: ((data: TaskCancelledData) => void) | undefined;
  private taskCompletedCallback: ((data: TaskCompletedData) => void) | undefined;
  private taskFailedCallback: ((data: TaskFailedData) => void) | undefined;
  private errorCallback: ((data: ErrorData) => void) | undefined;

  constructor(config: WSSessionBuilderConfig) {
    this.config = config;
  }

  onChatMessage(callback: (data: ChatSendData) => void): WSSessionBuilder {
    this.chatMessageCallback = callback;
    return this;
  }

  onChatStream(callback: (data: ChatStreamData) => void): WSSessionBuilder {
    this.chatStreamCallback = callback;
    return this;
  }

  onChatStreamEnd(callback: (data: ChatStreamEndData) => void): WSSessionBuilder {
    this.chatStreamEndCallback = callback;
    return this;
  }

  onChatCreated(callback: (data: ChatCreatedData) => void): WSSessionBuilder {
    this.chatCreatedCallback = callback;
    return this;
  }

  onChatReady(callback: (data: ChatReadyData) => void): WSSessionBuilder {
    this.chatReadyCallback = callback;
    return this;
  }

  onChatStatus(callback: (data: ChatStatusData) => void): WSSessionBuilder {
    this.chatStatusCallback = callback;
    return this;
  }

  onChatTerminated(callback: (data: ChatTerminatedData) => void): WSSessionBuilder {
    this.chatTerminatedCallback = callback;
    return this;
  }

  onChatAbortAck(callback: (data: ChatAbortAckData) => void): WSSessionBuilder {
    this.chatAbortAckCallback = callback;
    return this;
  }

  onTaskStarted(callback: (data: TaskStartedData) => void): WSSessionBuilder {
    this.taskStartedCallback = callback;
    return this;
  }

  onTaskCancelled(callback: (data: TaskCancelledData) => void): WSSessionBuilder {
    this.taskCancelledCallback = callback;
    return this;
  }

  onTaskCompleted(callback: (data: TaskCompletedData) => void): WSSessionBuilder {
    this.taskCompletedCallback = callback;
    return this;
  }

  onTaskFailed(callback: (data: TaskFailedData) => void): WSSessionBuilder {
    this.taskFailedCallback = callback;
    return this;
  }

  onError(callback: (data: ErrorData) => void): WSSessionBuilder {
    this.errorCallback = callback;
    return this;
  }

  connect(): WebSocketSessionFuture {
    return new WebSocketSessionFuture({
      parent: this.config.parent,
      wsEndpoint: this.config.wsEndpoint,
      tokenProvider: this.config.tokenProvider,
      webSocketClientFactory: this.config.webSocketClientFactory,
      chatMessageCallback: this.chatMessageCallback,
      chatStreamCallback: this.chatStreamCallback,
      chatStreamEndCallback: this.chatStreamEndCallback,
      chatCreatedCallback: this.chatCreatedCallback,
      chatReadyCallback: this.chatReadyCallback,
      chatStatusCallback: this.chatStatusCallback,
      chatTerminatedCallback: this.chatTerminatedCallback,
      chatAbortAckCallback: this.chatAbortAckCallback,
      taskStartedCallback: this.taskStartedCallback,
      taskCancelledCallback: this.taskCancelledCallback,
      taskCompletedCallback: this.taskCompletedCallback,
      taskFailedCallback: this.taskFailedCallback,
      errorCallback: this.errorCallback,
    });
  }
}
