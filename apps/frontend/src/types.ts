export type Category = { id: string; name: string; slug: string };

export type Product = {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
  currency: string;
  images: string[];
  description?: string | null;
  category?: Category | null;
   isBestSeller?: boolean; 
};



export type UploadResponse = { url: string };

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'CUSTOMER';
};

export type LoginResponse = {
  user: AuthUser;
  access_token: string;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type Cart = {
  items: CartItem[];
  total: number;
};
