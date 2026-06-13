import type { BackgroundTaskAgent } from '@walde.ai/ws-protocol';

export interface IWaldeWSSession {
  chatNew(params: { message: string; agent: string; projectId: string; briefId: string }): Promise<void>;
  chatSend(params: { chatId: string; message: string }): Promise<void>;
  chatAbort(params: { chatId: string }): Promise<void>;
  taskRun(params: { agent: BackgroundTaskAgent; projectId: string; briefId: string; initialPrompt: string; correlationId: string }): Promise<void>;
  taskCancel(params: { taskId: string }): Promise<void>;
  close(): void;
}
