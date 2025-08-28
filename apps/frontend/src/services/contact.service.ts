import { httpGetSecure, httpPost, httpPostSecure } from './httpClient';

export type ContactMessageDTO = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  replyText?: string | null;
  repliedAt?: string | null;
  createdAt: string;
};

export const contactService = {
  send: (payload: { name: string; email: string; message: string }) =>
    httpPost<{ ok: true }>('/contact', payload),

  list: () => httpGetSecure<ContactMessageDTO[]>('/admin/contact-messages'),
  reply: (id: string, replyText: string) =>
    httpPostSecure<ContactMessageDTO>(`/admin/contact-messages/${id}/reply`, {
      replyText,
    }),
};
