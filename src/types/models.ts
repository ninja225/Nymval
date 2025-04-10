
export type ModelType = {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  maxTokens: number;
  description?: string;
}

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  createdAt: number;
}

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastMessageDate: number;
  models: string[];
}
