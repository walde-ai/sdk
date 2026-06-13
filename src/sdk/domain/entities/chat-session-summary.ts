export interface ChatSessionSummary {
  chatId: string;
  agent: string;
  projectId: string | null;
  updatedAt: string;
  title: string;
  lastMessagePreview: string;
  terminated: boolean;
}
