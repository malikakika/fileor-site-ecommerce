import { httpGetSecure, httpPostSecure } from './httpClient';

export type ServerOrderItem = {
  id: string;         
  name: string;
  quantity: number;
  unitPriceCents?: number; 
  subtotalCents?: number;
  unitPrice?: number;
  subtotal?: number;
};

export type ServerOrder = {
  id: string;
  user?: { id: string; email?: string | null; name?: string | null } | null;

  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  address: string;

  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'STRIPE';
  status:
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'DELIVERED'
    | 'CANCELLED';

  items: ServerOrderItem[];

  totalCents?: number;    
  total?: number;         
  currency?: 'MAD' | 'EUR';

  createdAt: string;
};

export type OrderItemDTO = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;  
  subtotal: number;   
};

export type OrderDTO = {
  id: string;
  user?: { id: string; email?: string | null; name?: string | null } | null;

  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  address: string;

  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'STRIPE';
  status:
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'DELIVERED'
    | 'CANCELLED';

  items: OrderItemDTO[];

  total: number;               
  currency: 'MAD' | 'EUR';
  createdAt: string;
};

function normalizeOrder(o: ServerOrder): OrderDTO {
  const currency: 'MAD' | 'EUR' = (o.currency as any) || 'MAD';
  const total =
    o.totalCents != null ? o.totalCents / 100 :
    typeof o.total === 'number' ? o.total : 0;

  const items: OrderItemDTO[] = (o.items || []).map((it) => ({
    id: it.id,
    name: it.name,
    quantity: it.quantity,
    unitPrice:
      it.unitPriceCents != null
        ? it.unitPriceCents / 100
        : typeof it.unitPrice === 'number'
        ? it.unitPrice
        : 0,
    subtotal:
      it.subtotalCents != null
        ? it.subtotalCents / 100
        : typeof it.subtotal === 'number'
        ? it.subtotal
        : 0,
  }));

  return {
    id: o.id,
    user: o.user ?? null,
    customerName: o.customerName,
    customerEmail: o.customerEmail ?? null,
    customerPhone: o.customerPhone,
    address: o.address,
    paymentMethod: o.paymentMethod,
    status: o.status,
    items,
    total,
    currency,
    createdAt: o.createdAt,
  };
}

export type CreateOrderItemInput = {
  id: string;
  quantity: number;
};

export type CreateOrderPayload = {
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  address: string;
  city?: string;
  note?: string | null;
  market?: 'MA' | 'FR'; 
  items: CreateOrderItemInput[];  
  paymentMethod?: 'COD' | 'BANK_TRANSFER' | 'STRIPE';
};

export const ordersService = {
  create: async (payload: CreateOrderPayload) => {
    const products = await httpGetSecure<{ id: string; slug: string }[]>(
      '/products'
    );

    const byId = new Map(products.map(p => [p.id, p]));

    const safeItems = (payload.items || [])
      .map(it => {
        if (byId.has(it.id)) {
          return {
            id: it.id,
            quantity: Math.max(1, Number(it.quantity || 1)),
          };
        }
        return null; 
      })
      .filter(Boolean) as CreateOrderItemInput[];

    if (safeItems.length === 0) {
      localStorage.removeItem('cart_v2');
      throw new Error(
        'Votre panier contenait des produits qui ne sont plus disponibles.'
      );
    }

    const body = {
      paymentMethod: payload.paymentMethod ?? 'COD',
      market: payload.market ?? 'MA',

      customerName: payload.customerName,
      customerEmail: payload.customerEmail ?? '',
      customerPhone: payload.customerPhone,
      address: payload.address,
      note: payload.note ?? '',
      city: payload.city ?? '',

      customer: {
        fullName: payload.customerName,
        email: payload.customerEmail ?? '',
        phone: payload.customerPhone,
        address: payload.address,
        city: payload.city ?? '',
        note: payload.note ?? '',
      },

      items: safeItems,
    };

    return httpPostSecure<ServerOrder>('/orders', body).then(normalizeOrder);
  },

  adminList: (params?: { status?: string }) => {
    const status = params?.status ?? 'ALL';
    return httpGetSecure<ServerOrder[]>(`/admin/orders?status=${encodeURIComponent(status)}`)
      .then(arr => arr.map(normalizeOrder));
  },

  myOrders: () =>
    httpGetSecure<ServerOrder[]>('/orders/me').then(arr =>
      arr.map(normalizeOrder)
    ),
};

