import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { httpGet } from '../../services/httpClient';
import { useCart } from '../../context/cartContext';
import { useCurrency } from '../../context/currencyContext';
import { Product } from '../../types';
import { ensureDisplayUrl } from '../../services/uploads.service';
import { getCurrentUser } from '../../services/auth.service';
import AuthPromptModal from '../../components/authPromptModal';

const isHttpUrl = (s?: string) => !!s && /^https?:\/\//i.test(s);

function toCents(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.round(raw);
  if (typeof raw === 'string') {
    const s = raw.replace(',', '.').trim();
    if (/^\d+$/.test(s)) return Math.round(Number(s));
    const f = parseFloat(s);
    if (Number.isFinite(f)) return Math.round(f * 100);
  }
  return 0;
}
function priceCentsOf(p: any): number {
  if (p?.priceCents != null) return toCents(p.priceCents);
  if (p?.price_cents != null) return toCents(p.price_cents);
  if (p?.price != null) return toCents(p.price);
  return 0;
}
function unitPriceNumber(p: any): number {
  return Math.max(0, priceCentsOf(p)) / 100;
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { currency, setCurrency, convert, format } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await httpGet<Product[]>('/products');
        const normalized = data.map((p) => ({
          ...p,
          priceCents: priceCentsOf(p),
        }));
        if (!alive) return;
        setRawProducts(normalized);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Failed to load products');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const cache = new Map<string, string>();

    (async () => {
      const resolved = await Promise.all(
        rawProducts.map(async (p) => {
          const imgs = await Promise.all(
            (p.images || []).map(async (img) => {
              if (!img || isHttpUrl(img)) return img;
              if (cache.has(img)) return cache.get(img)!;
              const url = await ensureDisplayUrl(img);
              cache.set(img, url);
              return url;
            })
          );
          return { ...p, images: imgs };
        })
      );
      if (alive) setProducts(resolved);
    })();

    return () => {
      alive = false;
    };
  }, [rawProducts]);

  const categories = useMemo(() => {
    const set = new Map<string, string>();
    products.forEach((p) => {
      const s = p.category?.slug;
      const n = p.category?.name;
      if (s && n && !set.has(s)) set.set(s, n);
    });
    return Array.from(set, ([slug, name]) => ({ slug, name }));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const okCat = catFilter === 'all' || p.category?.slug === catFilter;
      const okSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q);
      return okCat && okSearch;
    });
  }, [products, query, catFilter]);

  const handleAddToCart = (p: Product, cover: string) => {
    const user = getCurrentUser();
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    const productCurrency = (p.currency as 'MAD' | 'EUR') || 'EUR';
    const price = unitPriceNumber(p);
    const priceInUserCurrency = convert(price, productCurrency, currency);

    addToCart({
      id: String(p.id),
      name: p.title?.trim() || p.slug,
      price: priceInUserCurrency,
      image: cover || '',
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <p>{t('common.loading') || 'Chargement...'}</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">
          {t('products.title') || 'Produits'}
        </h1>

        <div className="flex flex-wrap gap-2 items-center">
          <input
            className="border rounded px-3 py-2 w-56"
            placeholder={t('products.search') || 'Rechercher...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            className="border rounded px-3 py-2"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="all">
              {t('products.allCategories') || 'Toutes les catégories'}
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'MAD' | 'EUR')}
            title={t('currency.select') || 'Devise'}
          >
            <option value="MAD">MAD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink/70 text-center">
          {t('products.empty') || 'Aucun produit trouvé.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filtered.map((p) => {
            const cover = p.images?.[0] || '';
            const productCurrency = (p.currency as 'MAD' | 'EUR') || 'EUR';
            const price = unitPriceNumber(p);
            const priceInUserCurrency = convert(
              price,
              productCurrency,
              currency
            );
            const priceLabel = format(priceInUserCurrency, currency);

            return (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow border border-sand hover:shadow-lg transition"
              >
                {cover && (
                  <img
                    src={cover}
                    alt={p.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        'none';
                    }}
                  />
                )}

                <div className="p-4">
                  <div className="text-xs text-ink/60 mb-1">
                    {p.category?.name}
                  </div>
                  <h2 className="text-lg font-semibold mb-2">
                    {p.title?.trim() || p.slug}
                  </h2>

                  <p className="text-sunset font-bold mb-4">{priceLabel}</p>

                  <button
                    type="button"
                    className="bg-sunset text-white px-4 py-2 rounded hover:bg-berry transition"
                    onClick={() => handleAddToCart(p, cover)}
                  >
                    {t('products.addToCart') || 'Ajouter au panier'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
      />
    </div>
  );
}
