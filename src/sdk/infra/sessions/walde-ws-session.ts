import { IWaldeWSSession } from '@/sdk/domain/ports/in/walde-ws-session';
import { WSClientSession } from './ws-client-session';
import type { BackgroundTaskAgent } from '@walde.ai/ws-protocol';

export class WaldeWSSession implements IWaldeWSSession {
  private readonly session: WSClientSession;

  constructor(params: { session: WSClientSession }) {
    this.session = params.session;
  }

  async chatNew(params: { message: string; agent: string; projectId: string; briefId: string }): Promise<void> {
    await this.session.send('chat.new', { message: params.message, agent: params.agent, projectId: params.projectId, briefId: params.briefId });
  }

  async chatSend(params: { chatId: string; message: string }): Promise<void> {
    await this.session.send('chat.send', { chatId: params.chatId, message: params.message });
  }

  async chatAbort(params: { chatId: string }): Promise<void> {
    await this.session.send('chat.abort', { chatId: params.chatId });
  }

  async taskRun(params: { agent: BackgroundTaskAgent; projectId: string; briefId: string; initialPrompt: string; correlationId: string }): Promise<void> {
    await this.session.send('task.run', {
      agent: params.agent,
      projectId: params.projectId,
      briefId: params.briefId,
      initialPrompt: params.initialPrompt,
      correlationId: params.correlationId,
    });
  }

  async taskCancel(params: { taskId: string }): Promise<void> {
    await this.session.send('task.cancel', { taskId: params.taskId });
  }

  close(): void {
    this.session.close();
  }
}
