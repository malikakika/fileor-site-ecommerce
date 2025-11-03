import { httpGetSecure, httpPostSecure, httpDeleteSecure } from './httpClient';
import type { Product } from '../types';

export const favoritesService = {
  list: (): Promise<Product[]> => httpGetSecure<Product[]>('/favorites'),

  add: (productId: string): Promise<{ ok: true }> =>
    httpPostSecure(`/favorites/${productId}`, {}),

  remove: (productId: string): Promise<{ ok: true }> =>
    httpDeleteSecure(`/favorites/${productId}`),
};
