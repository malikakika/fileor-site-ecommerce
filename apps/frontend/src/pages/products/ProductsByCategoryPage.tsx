import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { httpGet } from '../../services/httpClient';
import { useCart } from '../../context/cartContext';
import { ensureDisplayUrl } from '../../services/uploads.service';

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
  currency: string;
  description?: string | null;
  images: string[];
  category?: Category | null;
};

const isHttp = (s?: string) => !!s && /^https?:\/\//i.test(s);

export default function ProductsByCategoryPage() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await httpGet<Product[]>('/products');
        if (!alive) return;
        setRawProducts(data);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Erreur chargement produits');
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
              if (!img || isHttp(img)) return img;
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

  const filtered = useMemo(
    () =>
      rawProducts.length === 0 && products.length === 0
        ? []
        : products.filter((p) => p.category?.slug === slug),
    [products, slug]
  );

  const formatPrice = (p: Product) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: p.currency || 'EUR',
    }).format((p.priceCents ?? 0) / 100);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        {t('common.loading') || 'Chargement...'}
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 text-red-600">{error}</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        {filtered[0]?.category?.name || slug}
      </h1>

      {filtered.length === 0 ? (
        <p className="text-center text-ink/70">
          {t('products.emptyCategory') || 'Aucun produit dans cette catégorie.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filtered.map((p) => {
            const cover = p.images?.[0] || '';
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
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2">
                    {p.title?.trim() || p.slug}
                  </h2>
                  <p className="text-sunset font-bold mb-4">{formatPrice(p)}</p>
                  <button
                    className="bg-sunset text-white px-4 py-2 rounded hover:bg-berry transition"
                    onClick={() =>
                      addToCart({
                        id: String(p.id),
                        name: p.title?.trim() || p.slug,
                        price: (p.priceCents ?? 0) / 100,
                        image: cover,
                      })
                    }
                  >
                    {t('products.addToCart') || 'Ajouter au panier'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
