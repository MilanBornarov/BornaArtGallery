import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import ArtworkModal from '../components/ArtworkModal';
import { GridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage() {
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const { favorites, loading } = useFavorites();
  const [selected, setSelected] = useState<Artwork | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-300 px-6">
        <p className="font-serif text-2xl italic text-white">{t('favorites.signInPrompt')}</p>
        <Link to="/login" className="btn-glass text-xs mt-2">{t('nav.signIn')}</Link>
      </div>
    );
  }

  return (
    <main className="page-shell max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-[0.625rem] tracking-[0.3em] uppercase text-[#f2d786] mb-2">{t('favorites.myCollection')}</p>
        <h1 className="section-title">{t('favorites.savedWorks')}</h1>
      </div>

      {loading ? (
        <GridSkeleton count={4} />
      ) : favorites.length === 0 ? (
        <div className="glass-panel py-24 text-center text-slate-300">
          <p className="font-serif text-2xl italic mb-3 text-white">{t('favorites.emptyTitle')}</p>
          <p className="text-sm mb-6">{t('favorites.emptyBody')}</p>
          <Link to="/gallery" className="btn-glass text-xs">{t('common.exploreGallery')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map(({ artwork }) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onClick={() => setSelected(artwork)}
              showFavorite={false}
            />
          ))}
        </div>
      )}

      {selected && (
        <ArtworkModal artwork={selected} onClose={() => setSelected(null)} hideNavbar />
      )}
    </main>
  );
}
