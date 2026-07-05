import { env } from '@/config/env';
import { getAuthHeaders, HttpError, request } from './http';

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

export type StreamDeltaPayload = {
  content?: string;
};

export type StreamDonePayload = {
  chatId?: string;
  message?: ChatMessage;
  title?: string;
};

export type StreamChatHandlers = {
  onDelta?: (payload: StreamDeltaPayload) => void;
  onDone?: (payload: StreamDonePayload) => void;
  signal?: AbortSignal;
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
      data?: ChatSummary[] | ChatPageData;
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

function parseSseBlock(block: string) {
  const lines = block.split(/\r?\n/);
  const dataLines: string[] = [];
  let event = 'message';

  lines.forEach(line => {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
      return;
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  });

  return {
    data: dataLines.join('\n'),
    event,
  };
}

function safelyParseJson<T>(value: string): T | undefined {
  if (!value || value === '[DONE]') {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

export async function streamChatApi(
  params: SendChatParams,
  handlers: StreamChatHandlers = {},
) {
  return new Promise<StreamDonePayload | undefined>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let cursor = 0;
    let buffer = '';
    let donePayload: StreamDonePayload | undefined;
    let settled = false;

    function finish(
      callback: typeof resolve | typeof reject,
      value?: StreamDonePayload | Error,
    ) {
      if (settled) {
        return;
      }

      settled = true;
      handlers.signal?.removeEventListener('abort', abort);
      callback(value as never);
    }

    function processBlock(block: string) {
      const parsed = parseSseBlock(block.trim());

      if (!parsed.data) {
        return;
      }

      if (parsed.event === 'delta') {
        const payload = safelyParseJson<StreamDeltaPayload>(parsed.data);

        if (payload) {
          handlers.onDelta?.(payload);
        }

        return;
      }

      if (parsed.event === 'done') {
        const payload = safelyParseJson<StreamDonePayload>(parsed.data);

        if (payload) {
          donePayload = payload;
          handlers.onDone?.(payload);
        }
      }
    }

    function processChunk(chunk: string) {
      buffer += chunk;

      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? '';
      blocks.forEach(processBlock);
    }

    function abort() {
      xhr.abort();
      finish(reject, new Error('请求已取消'));
    }

    xhr.open('POST', `${env.API_BASE_URL}/api/ai/chat/stream`);
    xhr.setRequestHeader('Accept', 'text/event-stream');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 120000;

    Object.entries(getAuthHeaders()).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.onprogress = () => {
      const chunk = xhr.responseText.slice(cursor);
      cursor = xhr.responseText.length;
      processChunk(chunk);
    };

    xhr.onload = () => {
      if (xhr.responseText.length > cursor) {
        processChunk(xhr.responseText.slice(cursor));
      }

      if (buffer.trim()) {
        processBlock(buffer);
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        finish(resolve, donePayload);
        return;
      }

      const errorData =
        safelyParseJson<unknown>(xhr.responseText) ?? xhr.responseText;
      finish(reject, new HttpError(xhr.status, xhr.statusText, errorData));
    };

    xhr.onerror = () => {
      finish(reject, new Error('流式请求失败'));
    };

    xhr.ontimeout = () => {
      finish(reject, new Error('流式请求超时'));
    };

    handlers.signal?.addEventListener('abort', abort);
    xhr.send(JSON.stringify(params));
  });
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
