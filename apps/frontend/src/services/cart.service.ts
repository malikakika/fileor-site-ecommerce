import { httpGetSecure, httpPostSecure, httpDeleteSecure } from './httpClient';

type RawProduct = {
  id: string;
  title: string;
  slug: string;
  images?: string[];
};

type RawCartItem = {
  id: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  currency: string;
  product?: RawProduct;
  updatedAt: string;
};

type RawCart = {
  id: string;
  currency: string;
  items: RawCartItem[];
};

export type CartItemDTO = {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  currency: string;
};

export type CartDTO = {
  id: string;
  currency: string;
  items: CartItemDTO[];
};

const toDTO = (raw: RawCart): CartDTO => ({
  id: raw.id,
  currency: raw.currency ?? 'EUR',
  items: raw.items.map((it) => ({
    id: it.id,
    name: it.product?.title ?? it.product?.slug ?? 'Produit',
    image: it.product?.images?.[0],
    quantity: it.quantity,
    price: (Number(it.unitPriceCents) || 0) / 100,
    currency: it.currency ?? raw.currency ?? 'EUR',
  })),
});

export const cartService = {
  async get(): Promise<CartDTO> {
    const data = await httpGetSecure<RawCart>('/cart');
    return toDTO(data);
  },

  async add(productId: string, quantity = 1): Promise<CartDTO> {
    const data = await httpPostSecure<RawCart>('/cart/items', {
      productId,
      quantity,
    });
    return toDTO(data);
  },

  async remove(itemId: string): Promise<CartDTO> {
    const data = await httpDeleteSecure<RawCart>(`/cart/items/${itemId}`);
    return toDTO(data);
  },

  async clear(): Promise<CartDTO> {
    const data = await httpDeleteSecure<RawCart>('/cart');
    return toDTO(data);
  },
};
