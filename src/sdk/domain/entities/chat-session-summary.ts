export interface ChatSessionSummary {
  chatId: string;
  agent: string;
  projectId: string | null;
  briefId: string;
  updatedAt: string;
  title: string;
  lastMessagePreview: string;
  terminated: boolean;
}
