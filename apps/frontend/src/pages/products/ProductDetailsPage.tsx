import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { httpGet } from "../../services/httpClient";
import { Product } from "../../types";
import { useCart } from "../../context/cartContext";
import { useCurrency } from "../../context/currencyContext";
import { useFavorites } from "../../context/favoritesContext";
import { Heart, ShoppingCart } from "lucide-react";

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { currency, convert, format } = useCurrency();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await httpGet<Product>(`/products/${slug}`);
        setProduct(data);
      } catch (e) {
        setError("Produit introuvable");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const priceLabel = useMemo(() => {
    if (!product) return "";
    const price = (product.priceCents || 0) / 100;
    const productCurrency = (product.currency as "MAD" | "EUR") || "EUR";
    const priceConverted = convert(price, productCurrency, currency);
    return format(priceConverted, currency);
  }, [product, currency]);

  if (loading) return <p className="p-10">Chargement...</p>;
  if (error || !product) return <p className="p-10 text-red-600">{error}</p>;

  const images = (product.images || []).map((url) => ({
    original: url,
    thumbnail: url,
  }));

  const fav = isFavorite(product.id);

  const handleToggleFavorite = async () => {
    await toggleFavorite(product);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <ImageGallery
          items={images}
          showFullscreenButton
          showPlayButton={false}
          thumbnailPosition="bottom"
        />
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
        
        </div>

        <p
          className="text-gray-700 mb-6 text-justify leading-relaxed break-words whitespace-pre-line"
          style={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-line",
            lineHeight: "1.6",
            textAlign: "justify",
          }}
        >
          {product.description}
        </p>

        <div className="text-2xl font-semibold text-blue-600 mb-6">
          {priceLabel}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() =>
              addToCart({
                id: String(product.id),
                name: product.title,
                price: (product.priceCents || 0) / 100,
                image: product.images?.[0] || "",
              })
            }
            className="flex items-center justify-center bg-sunset text-white px-5 py-3 rounded-md hover:bg-ink transition"
          >
            <ShoppingCart size={20} className="mr-2" />
            Ajouter au panier
          </button>

          <button
            onClick={handleToggleFavorite}
            className={`flex items-center justify-center border px-5 py-3 rounded-md transition ${
              fav
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white text-red-500 hover:bg-red-100"
            }`}
          >
            <Heart
              size={20}
              className="mr-2"
              fill={fav ? "currentColor" : "none"}
            />
            {fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          </button>
        </div>
      </div>
    </div>
  );
}
