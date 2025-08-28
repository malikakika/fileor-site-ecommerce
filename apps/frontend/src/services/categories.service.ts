import { Category } from '../types';
import { httpGet, httpPost, httpDeleteSecure } from './httpClient';

export const categoriesService = {
  list: () => httpGet<Category[]>('/categories'),
  create: (payload: { name: string; slug: string }) =>
    httpPost<Category>('/categories', payload),
  delete: (id: string) => httpDeleteSecure<{ ok: true }>(`/categories/${id}`),
};
