import { ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth.service';

interface ProductCardProps {
  id: number;
  name: string;
  image: string;
  price: string; 
  onAddToCart?: (id: number) => void;
}

export default function ProductCard({
  id,
  name,
  image,
  price,
  onAddToCart,
}: ProductCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddToCart = () => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/register', { state: { next: location.pathname } });
      return;
    }
    onAddToCart?.(id);
  };

  return (
    <div className="bg-white border border-sunset rounded-lg shadow hover:shadow-lg transition">
      <img
        src={image}
        alt={name}
        className="w-full h-48 object-cover rounded-t-lg"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="p-4 flex flex-col justify-between h-40">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-berry font-bold mb-3">{price}</p>
        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center bg-sunset text-white px-4 py-2 rounded hover:bg-berry transition font-medium"
          title={t('common.add_to_cart') || 'Ajouter au panier'}
        >
          <ShoppingCart size={18} className="mr-2" />
          {t('common.add_to_cart')}
        </button>
      </div>
    </div>
  );
}
