export interface ChatSessionDetail {
  chatId: string;
  agent: string;
  projectId: string | null;
  updatedAt: string;
  messages: Array<{ role: string; text: string }>;
}
