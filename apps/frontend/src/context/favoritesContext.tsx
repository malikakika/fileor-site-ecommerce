import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { favoritesService } from "../services/favorites.service";
import { AUTH_EVENT, getToken } from "../services/auth.service";
import type { Product } from "../types";

type FavoritesContextType = {
  favorites: Product[];
  loading: boolean;
  addFavorite: (product: Product) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  toggleFavorite: (product: Product) => Promise<void>;
  clearFavorites: () => Promise<void>;
  isFavorite: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

const GUEST_FAV_KEY = "guest_favorites";

function readGuestFavorites(): Product[] {
  try {
    const raw = localStorage.getItem(GUEST_FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestFavorites(items: Product[]) {
  try {
    localStorage.setItem(GUEST_FAV_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean>(!!getToken());

  useEffect(() => {
    const onAuthChange = () => setAuthed(!!getToken());
    window.addEventListener("storage", onAuthChange);
    window.addEventListener(AUTH_EVENT, onAuthChange);
    return () => {
      window.removeEventListener("storage", onAuthChange);
      window.removeEventListener(AUTH_EVENT, onAuthChange);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        if (authed) {
          const favs = await favoritesService.list();
          if (alive) setFavorites(favs);
        } else {
          setFavorites(readGuestFavorites());
        }
      } catch (err) {
        console.error("Erreur chargement favoris:", err);
        if (alive) setFavorites(readGuestFavorites());
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [authed]);

  const addFavorite = async (product: Product) => {
    if (authed) {
      try {
        await favoritesService.add(product.id);
        setFavorites((prev) => {
          if (prev.some((p) => p.id === product.id)) return prev;
          return [...prev, product];
        });
      } catch (e) {
        console.error("Erreur addFavorite:", e);
      }
      return;
    }
    setFavorites((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      const next = [...prev, product];
      writeGuestFavorites(next);
      return next;
    });
  };

  const removeFavorite = async (productId: string) => {
    if (authed) {
      try {
        await favoritesService.remove(productId);
      } catch (e) {
        console.error("Erreur removeFavorite:", e);
      }
    }
    setFavorites((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      writeGuestFavorites(next);
      return next;
    });
  };

  const toggleFavorite = async (product: Product) => {
    const isFav = favorites.some((p) => p.id === product.id);
    if (isFav) {
      await removeFavorite(product.id);
    } else {
      await addFavorite(product);
    }
  };

  const clearFavorites = async () => {
    if (authed) {
      try {
        for (const f of favorites) {
          await favoritesService.remove(f.id);
        }
      } catch (e) {
        console.error("Erreur clearFavorites:", e);
      }
    }
    setFavorites([]);
    writeGuestFavorites([]);
  };

  const isFavorite = (id: string) => favorites.some((p) => p.id === id);

  const value = useMemo<FavoritesContextType>(
    () => ({
      favorites,
      loading,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
      isFavorite,
    }),
    [favorites, loading]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
};
