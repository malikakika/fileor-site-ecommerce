import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/cartContext';
import { ensureDisplayUrl } from '../services/uploads.service';

type DisplayItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  resolvedImage: string;
};

const isHttp = (s?: string) => !!s && /^https?:\/\//i.test(s);
const fmtDH = (n: number | string | undefined | null) => {
  const v =
    typeof n === 'number'
      ? n
      : typeof n === 'string'
      ? parseFloat(n.replace(',', '.'))
      : 0;
  if (!Number.isFinite(v)) return '0.00 DH';
  return `${v.toFixed(2)} DH`;
};

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { t } = useTranslation();

  const [items, setItems] = useState<DisplayItem[]>([]);

  useEffect(() => {
    let alive = true;
    const cache = new Map<string, string>();

    (async () => {
      const resolved = await Promise.all(
        cart.map(async (it) => {
          const priceNum =
            typeof it.price === 'number'
              ? it.price
              : parseFloat(String(it.price).replace(',', '.')) || 0;
          const qtyNum = Math.max(1, Math.round(Number(it.quantity) || 1));

          let resolvedImage = '';
          const raw = it.image;
          if (raw) {
            if (isHttp(raw)) resolvedImage = raw;
            else if (cache.has(raw)) resolvedImage = cache.get(raw)!;
            else {
              try {
                resolvedImage = await ensureDisplayUrl(raw);
                cache.set(raw, resolvedImage);
              } catch {
                resolvedImage = '';
              }
            }
          }

          return {
            id: String(it.id),
            name: String(it.name ?? ''),
            price: priceNum,
            quantity: qtyNum,
            image: raw,
            resolvedImage,
          } as DisplayItem;
        })
      );
      if (alive) setItems(resolved);
    })();

    return () => {
      alive = false;
    };
  }, [cart]);

  const totalItems = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity, 0),
    [items]
  );

  const grandTotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        {t('cart.title') || 'Panier'}
      </h1>

      {items.length === 0 ? (
        <div className="text-center text-lg">
          <p className="mb-4">{t('cart.empty') || 'Votre panier est vide.'}</p>
          <Link
            to="/products"
            className="bg-sunset text-white px-4 py-2 rounded hover:bg-berry transition"
          >
            {t('cart.shopNow') || 'Découvrir les produits'}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm text-ink/70 px-2">
            <div className="col-span-6">{t('cart.product') || 'Produit'}</div>
            <div className="col-span-2 text-right">
              {t('cart.price') || 'Prix'}
            </div>
            <div className="col-span-2 text-center">
              {t('cart.quantity') || 'Quantité'}
            </div>
            <div className="col-span-2 text-right">
              {t('cart.subtotal') || 'Sous-total'}
            </div>
          </div>

          <ul className="space-y-4">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              return (
                <li
                  key={item.id}
                  className="bg-white p-4 rounded-lg shadow border border-sand"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                      {item.resolvedImage ? (
                        <img
                          src={item.resolvedImage}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded border"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded bg-gray-100" />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold">{item.name}</h2>
                        <div className="mt-1 md:hidden text-sm text-ink/70">
                          {fmtDH(item.price)} × {item.quantity} ={' '}
                          <span className="font-medium">
                            {fmtDH(lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block col-span-2 text-right">
                      {fmtDH(item.price)}
                    </div>
                    <div className="hidden md:block col-span-2 text-center">
                      {item.quantity}
                    </div>
                    <div className="hidden md:block col-span-2 text-right font-medium">
                      {fmtDH(lineTotal)}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 inline-flex items-center gap-2"
                      aria-label={t('cart.removeItem') || 'Supprimer l’article'}
                      title={t('cart.removeItem') || 'Supprimer l’article'}
                    >
                      <Trash2 size={18} />
                      <span className="text-sm">
                        {t('cart.removeItem') || 'Retirer'}
                      </span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-ink/80">
              {t('cart.itemsCount')
                ? t('cart.itemsCount', { count: totalItems })
                : `Articles : ${totalItems}`}
            </div>

            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">
                {t('cart.total') || 'Total'}: {fmtDH(grandTotal)}
              </h2>
              <button
                onClick={clearCart}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                {t('cart.clear') || 'Vider'}
              </button>
              <button className="bg-sunset text-white px-6 py-2 rounded hover:bg-berry transition">
                {t('cart.checkout') || 'Payer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
