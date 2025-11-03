import { Heart, ShoppingCart } from 'lucide-react';
import { useFavorites } from '../context/favoritesContext';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth.service';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  price: string;
  onAddToCart?: (id: string) => void;
}

export default function ProductCard({ product, price, onAddToCart }: ProductCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(product.id);

  const handleAddToCart = () => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login', { state: { next: location.pathname } });
      return;
    }
    onAddToCart?.(product.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <div
      className="bg-white border border-sunset rounded-lg shadow hover:shadow-lg transition flex flex-col cursor-pointer relative"
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      <button
        onClick={handleFavorite}
        className="absolute top-3 right-3 text-red-500 hover:scale-110 transition"
        title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart fill={fav ? 'currentColor' : 'none'} />
      </button>

      {product.images?.[0] && (
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      )}

      <div className="p-4 flex flex-col justify-between flex-grow">
        <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
        <p className="text-berry font-bold mb-3">{price}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className="flex items-center justify-center bg-sunset text-white px-4 py-2 rounded hover:bg-berry transition font-medium"
        >
          <ShoppingCart size={18} className="mr-2" />
          {t('common.add_to_cart')}
        </button>
      </div>
    </div>
  );
}
