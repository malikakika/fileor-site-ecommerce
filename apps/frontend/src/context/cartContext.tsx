import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { AUTH_EVENT, getToken } from '../services/auth.service';
import { cartService } from '../services/cart.service';

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'guest_cart';

function toNumberSafe(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}
function normalizePriceFromAny(raw: any): number {
  if (raw?.priceCents != null) {
    const c = Number(raw.priceCents);
    if (Number.isFinite(c)) return Math.max(0, c) / 100;
  }
  const p = toNumberSafe(raw?.price);
  return p > 0 ? p : 0;
}

function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const arr: any[] = raw ? JSON.parse(raw) : [];
    return arr.map((it) => ({
      id: String(it.id ?? ''),
      name: String(it.name ?? ''),
      price: normalizePriceFromAny(it),
      image: typeof it.image === 'string' ? it.image : undefined,
      quantity: Math.max(1, Math.round(toNumberSafe(it.quantity) || 1)),
    }));
  } catch {
    return [];
  }
}
function writeGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean>(!!getToken());

  useEffect(() => {
    const onAuthChange = () => setAuthed(!!getToken());
    window.addEventListener('storage', onAuthChange);
    window.addEventListener(AUTH_EVENT, onAuthChange);
    return () => {
      window.removeEventListener('storage', onAuthChange);
      window.removeEventListener(AUTH_EVENT, onAuthChange);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        if (authed) {
          const data = await cartService.get();
          if (!alive) return;
          const items: CartItem[] = (data.items || []).map((it: any) => ({
            id: String(it.id ?? ''),
            name: String(it.name ?? ''),
            price: normalizePriceFromAny(it),
            image: typeof it.image === 'string' ? it.image : undefined,
            quantity: Math.max(1, Math.round(toNumberSafe(it.quantity) || 1)),
          }));
          setCart(items);
        } else {
          setCart(readGuestCart());
        }
      } catch {
        setCart(readGuestCart());
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [authed]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    if (authed) {
      const data = await cartService.add(item.id, qty);
      const items: CartItem[] = (data.items || []).map((it: any) => ({
        id: String(it.id ?? ''),
        name: String(it.name ?? ''),
        price: normalizePriceFromAny(it),
        image: typeof it.image === 'string' ? it.image : undefined,
        quantity: Math.max(1, Math.round(toNumberSafe(it.quantity) || 1)),
      }));
      setCart(items);
      return;
    }
    // invité
    setCart((prev) => {
      const price = normalizePriceFromAny(item);
      const quantity = Math.max(1, Math.round(qty || 1));
      const existing = prev.find((p) => p.id === item.id);
      const next = existing
        ? prev.map((p) =>
            p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p
          )
        : [...prev, { ...item, price, quantity }];
      writeGuestCart(next);
      return next;
    });
  };

  const removeFromCart = async (id: string) => {
    if (authed) {
      const data = await cartService.remove(id);
      const items: CartItem[] = (data.items || []).map((it: any) => ({
        id: String(it.id ?? ''),
        name: String(it.name ?? ''),
        price: normalizePriceFromAny(it),
        image: typeof it.image === 'string' ? it.image : undefined,
        quantity: Math.max(1, Math.round(toNumberSafe(it.quantity) || 1)),
      }));
      setCart(items);
      return;
    }
    setCart((prev) => {
      const next = prev.filter((i) => i.id !== id);
      writeGuestCart(next);
      return next;
    });
  };

  const clearCart = async () => {
    if (authed) {
      const data = await cartService.clear();
      const items: CartItem[] = (data.items || []).map((it: any) => ({
        id: String(it.id ?? ''),
        name: String(it.name ?? ''),
        price: normalizePriceFromAny(it),
        image: typeof it.image === 'string' ? it.image : undefined,
        quantity: Math.max(1, Math.round(toNumberSafe(it.quantity) || 1)),
      }));
      setCart(items);
      return;
    }
    setCart([]);
    writeGuestCart([]);
  };

  const value = useMemo<CartContextType>(
    () => ({ cart, loading, addToCart, removeFromCart, clearCart }),
    [cart, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
