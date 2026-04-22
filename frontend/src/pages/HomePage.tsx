import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGetArtworks, apiGetFeatured } from '../services/api';
import type { Artwork } from '../types';
import Carousel from '../components/Carousel';
import ArtworkCard from '../components/ArtworkCard';
import ArtworkModal from '../components/ArtworkModal';
import { CarouselSkeleton, GridSkeleton } from '../components/LoadingSkeleton';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();
  const [featured, setFeatured] = useState<Artwork[]>([]);
  const [recent, setRecent] = useState<Artwork[]>([]);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingGrid, setLoadingGrid] = useState(true);

  useEffect(() => {
    apiGetFeatured()
      .then((r) => setFeatured(r.data))
      .finally(() => setLoadingHero(false));

    apiGetArtworks()
      .then((r) => setRecent(r.data.slice(0, 8)))
      .finally(() => setLoadingGrid(false));
  }, []);

  return (
    <main>
      {loadingHero ? (
        <CarouselSkeleton />
      ) : featured.length > 0 ? (
        <Carousel artworks={featured} />
      ) : (
        <div className="hero-empty-state">
          <p className="font-serif text-white/40 text-2xl italic">
            {t('home.heroEmpty')}
          </p>
        </div>
      )}

      <section className="glass-panel mt-8 py-12 px-6 text-center page-shell overflow-hidden">
        <p className="text-[0.625rem] tracking-[0.4em] uppercase text-[#f2d786] mb-3">{t('home.welcome')}</p>
        <img
          src="/homeLogo.png"
          alt={t('common.brand')}
          className="mx-auto mb-4 w-full max-w-[20rem] md:max-w-[25rem] lg:max-w-[30rem] h-auto object-contain"
        />
        <p className="text-slate-300 max-w-lg mx-auto text-sm leading-relaxed">
          {t('home.intro')}
        </p>
        <Link to="/gallery" className="btn-glass inline-flex mt-6 text-xs">
          {t('common.exploreGallery')}
        </Link>
      </section>

      <section className="page-shell max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[0.625rem] tracking-[0.3em] uppercase text-[#f2d786] mb-2">{t('home.collection')}</p>
            <h2 className="section-title">{t('home.recentWorks')}</h2>
          </div>

          <Link to="/gallery" className="text-sm text-slate-300 hover:text-white transition-colors tracking-wider">
            {t('common.viewAll')} &rarr;
          </Link>
        </div>

        {loadingGrid ? (
          <GridSkeleton count={8} />
        ) : recent.length === 0 ? (
          <div className="glass-panel py-20 text-center text-slate-300">
            <p className="font-serif text-2xl italic mb-2 text-white">{t('home.noArtworks')}</p>
            <p className="text-sm">{t('home.checkBackSoon')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recent.map((art) => (
              <ArtworkCard
                key={art.id}
                artwork={art}
                onClick={() => setSelected(art)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="glass-panel-dark mx-4 sm:mx-6 lg:mx-8 py-20 px-6 text-center rounded-t-[2rem] rounded-b-none border-b-0">
        <h2 className="font-serif text-3xl text-white font-normal mb-4">
          {t('home.saveWorksTitle')}
        </h2>
        <p className="text-slate-300 text-sm max-w-md mx-auto mb-8">
          {t('home.saveWorksBody')}
        </p>
        <Link to="/gallery" className="btn-glass-gold">
          {t('common.browseGallery')}
        </Link>
      </section>

      {selected && (
        <ArtworkModal artwork={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
