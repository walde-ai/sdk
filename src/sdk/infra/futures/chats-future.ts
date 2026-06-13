import { Future, Result, ok, err } from '@/std';
import type { WaldeAdmin } from './walde-admin-future';
import { ChatSessionSummary } from '@/sdk/domain/entities/chat-session-summary';
import { ChatSessionRepository } from '@/sdk/domain/ports/out/chat-session-repository';

export class ChatsFuture extends Future<ChatSessionSummary[], WaldeAdmin> {
  private chatSessionRepo: ChatSessionRepository;

  constructor({ parent, chatSessionRepo }: { parent: WaldeAdmin; chatSessionRepo: ChatSessionRepository }) {
    super({ parent });
    this.chatSessionRepo = chatSessionRepo;
  }

  async resolve(): Promise<Result<ChatSessionSummary[], string>> {
    try {
      const chats = await this.chatSessionRepo.list();
      return ok(chats);
    } catch (e: unknown) {
      return err(e instanceof Error ? e.message : String(e));
    }
  }
}
