import { httpGetSecure, httpPost, httpPostSecure } from './httpClient';

export type ChatMessage = {
  id: string;
  conversation: { id: string };
  author?: { id: string; email?: string; name?: string } | null;
  direction: 'USER' | 'ADMIN';
  body: string;
  createdAt: string;
  readByUser: boolean;
  readByAdmin: boolean;
};

export type ConversationDTO = {
  id: string;
  user?: { id: string; email: string; name?: string | null } | null;
  contactEmail?: string | null;
  contactName?: string | null;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
};

export const chatService = {
  myMessages: () => httpGetSecure<ChatMessage[]>('/chat/me/messages'),
  sendMyMessage: (text: string) =>
    httpPostSecure<ChatMessage>('/chat/me/messages', { text }),

  publicSend: (payload: { name: string; email: string; text: string }) =>
    httpPost<ChatMessage>('/chat/public', payload),

  listConversations: () =>
    httpGetSecure<ConversationDTO[]>('/chat/conversations'),
  listMessages: (convId: string) =>
    httpGetSecure<ChatMessage[]>(`/chat/conversations/${convId}/messages`),
  reply: (convId: string, text: string) =>
    httpPostSecure<ChatMessage>(`/chat/conversations/${convId}/reply`, {
      text,
    }),
};
