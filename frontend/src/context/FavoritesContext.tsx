import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiAddFavorite, apiGetFavorites, apiRemoveFavorite } from '../services/api';
import type { Favorite } from '../types';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  favorites: Favorite[];
  favoriteIds: Set<number>;
  loading: boolean;
  isFav: (id: number) => boolean;
  toggle: (artworkId: number) => Promise<void>;
  reload: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!isLoggedIn) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      const response = await apiGetFavorites();
      setFavorites(response.data);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggle = useCallback(async (artworkId: number) => {
    if (!isLoggedIn) return;

    const previousFavorites = favorites;
    const currentlyFavorite = favorites.some((favorite) => favorite.artwork.id === artworkId);

    setFavorites((current) =>
      currentlyFavorite
        ? current.filter((favorite) => favorite.artwork.id !== artworkId)
        : current,
    );

    try {
      if (currentlyFavorite) {
        await apiRemoveFavorite(artworkId);
      } else {
        const response = await apiAddFavorite(artworkId);
        setFavorites((current) =>
          current.some((favorite) => favorite.artwork.id === artworkId)
            ? current
            : [response.data, ...current],
        );
      }
    } catch {
      setFavorites(previousFavorites);
    }
  }, [favorites, isLoggedIn]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.artwork.id)),
    [favorites],
  );

  const value = useMemo<FavoritesContextValue>(() => ({
    favorites,
    favoriteIds,
    loading,
    isFav: (id: number) => favoriteIds.has(id),
    toggle,
    reload,
  }), [favorites, favoriteIds, loading, toggle, reload]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavoritesContext() {
  const value = useContext(FavoritesContext);
  if (!value) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return value;
}
