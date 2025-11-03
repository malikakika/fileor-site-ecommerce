import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useFavorites } from "../context/favoritesContext";

export default function FavoritesPage() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

  if (!favorites.length) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Vos favoris</h1>
        <p className="text-gray-600">
          Vous n’avez encore ajouté aucun produit à vos favoris.
        </p>
        <Link
          to="/products"
          className="inline-block mt-6 bg-black text-white px-5 py-3 rounded hover:bg-gray-800 transition"
        >
          Découvrir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Favoris </h1>
        <button
          onClick={clearFavorites}
          className="text-red-600 hover:underline"
        >
          Tout supprimer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {favorites.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg shadow hover:shadow-md transition bg-white"
          >
            <Link to={`/product/${p.slug}`}>
              <img
                src={p.images?.[0] || ""}
                alt={p.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </Link>

            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{p.title}</h3>
              {p.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {p.description}
                </p>
              )}

              <div className="flex justify-between items-center mt-3">
                <Link
                  to={`/product/${p.slug}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Voir le produit
                </Link>
                <button
                  onClick={() => removeFavorite(p.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Retirer des favoris"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
