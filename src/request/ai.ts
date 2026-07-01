import { request } from './http';

export type ChatSummary = {
  chatId?: string;
  createdAt?: string;
  id?: string;
  messages?: ChatMessage[];
  name?: string;
  title?: string;
  updatedAt?: string;
};

export type ChatsParams = {
  current: number;
  pageSize: number;
};

export type ChatMessage = {
  content: string;
  role: 'assistant' | 'user';
};

export type SendChatParams = {
  chatId?: string;
  messages: ChatMessage[];
  provider: string;
};

export type SendChatResponse = {
  chatId?: string;
  data?: {
    chatId?: string;
    message?: {
      content?: string;
    };
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };
};

export type ChatDetailData = {
  chatId?: string;
  id?: string;
  messages?: ChatMessage[];
  title?: string;
};

export type ChatDetailResponse = {
  chatId?: string;
  data?: ChatDetailData;
  id?: string;
  messages?: ChatMessage[];
  title?: string;
};

export type ChatPageData = {
  chats?: ChatSummary[];
  current?: number;
  hasMore?: boolean;
  items?: ChatSummary[];
  list?: ChatSummary[];
  pageSize?: number;
  records?: ChatSummary[];
  total?: number;
};

export type ChatsResponse =
  | ChatSummary[]
  | {
      data?:
        | ChatSummary[]
        | ChatPageData;
      chats?: ChatSummary[];
      list?: ChatSummary[];
      records?: ChatSummary[];
      total?: number;
    };

export function getChatsApi(params: ChatsParams) {
  return request.get<ChatsResponse>('/api/ai/chats', params).send();
}

export function sendChatApi(params: SendChatParams) {
  return request
    .post<SendChatResponse>('/api/ai/chat', params, { timeout: 120000 })
    .send();
}

export function getChatDetailApi(chatId: string) {
  return request
    .get<ChatDetailResponse>(`/api/ai/chats/${encodeURIComponent(chatId)}`)
    .send();
}

export function deleteChatApi(chatId: string) {
  return request
    .delete<{ success?: boolean }>(`/api/ai/chats/${encodeURIComponent(chatId)}`)
    .send();
}
