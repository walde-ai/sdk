import { ChatSessionRepository } from '@/sdk/domain/ports/out/chat-session-repository';
import { ChatSessionSummary } from '@/sdk/domain/entities/chat-session-summary';
import { ChatSessionDetail } from '@/sdk/domain/entities/chat-session-detail';
import { ApiClient } from '@/sdk/infra/adapters/api-client';

export class HttpChatSessionRepository implements ChatSessionRepository {
  private static readonly BASE_PATH = '/v1/chats';

  constructor(private readonly apiClient: ApiClient) {}

  async list(): Promise<ChatSessionSummary[]> {
    const data = await this.apiClient.get<{ chats: ChatSessionSummary[] }>(
      HttpChatSessionRepository.BASE_PATH
    );
    return data.chats;
  }

  async get(chatId: string): Promise<ChatSessionDetail> {
    return this.apiClient.get<ChatSessionDetail>(
      `${HttpChatSessionRepository.BASE_PATH}/${chatId}`
    );
  }
}
