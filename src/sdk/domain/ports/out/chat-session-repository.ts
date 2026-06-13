import { ChatSessionSummary } from '@/sdk/domain/entities/chat-session-summary';
import { ChatSessionDetail } from '@/sdk/domain/entities/chat-session-detail';

export interface ChatSessionRepository {
  list(): Promise<ChatSessionSummary[]>;
  get(chatId: string): Promise<ChatSessionDetail>;
}
