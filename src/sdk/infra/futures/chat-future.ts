import { Future, Result, ok, err } from '@/std';
import type { WaldeAdmin } from './walde-admin-future';
import { ChatSessionDetail } from '@/sdk/domain/entities/chat-session-detail';
import { ChatSessionRepository } from '@/sdk/domain/ports/out/chat-session-repository';

export class ChatFuture extends Future<ChatSessionDetail, WaldeAdmin> {
  private chatSessionRepo: ChatSessionRepository;
  private chatId: string;

  constructor({ parent, chatSessionRepo, chatId }: { parent: WaldeAdmin; chatSessionRepo: ChatSessionRepository; chatId: string }) {
    super({ parent });
    this.chatSessionRepo = chatSessionRepo;
    this.chatId = chatId;
  }

  async resolve(): Promise<Result<ChatSessionDetail, string>> {
    try {
      const chat = await this.chatSessionRepo.get(this.chatId);
      return ok(chat);
    } catch (e: unknown) {
      return err(e instanceof Error ? e.message : String(e));
    }
  }
}
