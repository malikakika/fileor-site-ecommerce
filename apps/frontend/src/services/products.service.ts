import { Product } from '../types';
import {
  httpGet,
  httpPost,
  httpPatchSecure,
  httpDeleteSecure,
} from './httpClient';

export const productsService = {
  list: () => httpGet<Product[]>('/products'),
  create: (payload: {
    title: string;
    slug: string;
    priceCents: number;
    currency?: string;
    images?: string[];
    description?: string | null;
    categoryId?: string;
  }) => httpPost<Product>('/products', payload),
  update: (id: string, patch: Partial<Product>) =>
    httpPatchSecure<Product>(`/products/${id}`, patch),
  delete: (id: string) => httpDeleteSecure<{ ok: true }>(`/products/${id}`),
};
