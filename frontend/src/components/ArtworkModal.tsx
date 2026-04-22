import { useEffect } from 'react';
import type { Artwork } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import {
  getArtworkCategory,
  getArtworkDescription,
  getArtworkTitle,
  getStatusLabel,
} from '../i18n/helpers';

const FACEBOOK_LINK = import.meta.env.VITE_PUBLIC_FACEBOOK_LINK || '<FACEBOOK_LINK>';

interface Props {
  artwork: Artwork;
  onClose: () => void;
}

export default function ArtworkModal({ artwork, onClose }: Props) {
  const { isLoggedIn } = useAuth();
  const { isFav, toggle } = useFavorites();
  const { locale, t } = useLanguage();
  const favorited = isFav(artwork.id);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const buyLink = artwork.facebookLink || FACEBOOK_LINK;
  const title = getArtworkTitle(artwork, locale);
  const category = getArtworkCategory(artwork, locale);
  const description = getArtworkDescription(artwork, locale);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 flex-shrink-0 bg-gallery-dark">
            <img src={artwork.imageUrl} alt={title} className="w-full h-[24rem] lg:h-full object-cover" />
          </div>

          <div className="lg:w-1/2 p-8 flex flex-col justify-between">
            <div>
              {category ? (
                <p className="text-[0.625rem] tracking-[0.3em] uppercase text-gallery-gold mb-3">{category}</p>
              ) : null}

              <h2 className="font-serif text-3xl text-slate-50 font-normal leading-tight mb-2">{title}</h2>

              <p className="text-slate-300 text-sm mb-2">
                {t('artwork.artistLine')}
                {artwork.year ? ` · ${artwork.year}` : ''}
              </p>

              {artwork.width != null && artwork.height != null ? (
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-4">
                  {t('artwork.size')}: {t('artwork.sizeValue', { width: artwork.width, height: artwork.height })}
                </p>
              ) : null}

              <p
                className={`inline-block status-badge-glass text-[0.625rem] tracking-widest uppercase px-2.5 py-1 mb-6 ${
                  artwork.status === 'SOLD' ? 'status-badge-sold' : 'status-badge-available'
                }`}
              >
                {getStatusLabel(artwork.status, locale)}
              </p>

              <div className="w-10 h-px bg-gallery-gold mb-6" />

              {description ? <p className="text-slate-200 text-sm leading-relaxed text-pre-wrap">{description}</p> : null}
            </div>

            <div className="mt-8 flex gap-3 flex-wrap">
              {isLoggedIn ? (
                <button
                  onClick={() => toggle(artwork.id)}
                  className={`flex-1 py-3 text-sm tracking-wider transition-all duration-300 border rounded-[var(--radius-xl)] ${
                    favorited
                      ? 'border-gallery-gold/70 bg-gallery-gold/15 text-gallery-cream shadow-[0_0_0_1px_rgba(245,202,72,0.22),0_1rem_2rem_rgba(201,168,76,0.14)]'
                      : 'border-white/15 text-slate-50 hover:border-gallery-gold/60 hover:bg-white/10'
                  }`}
                >
                  {favorited ? `\u2665 ${t('artwork.savedAction')}` : `\u2661 ${t('artwork.saveAction')}`}
                </button>
              ) : null}

              <a
                href={buyLink}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 py-3 text-sm tracking-wider text-center border rounded-[var(--radius-xl)] transition-all duration-300 ${
                  artwork.status === 'SOLD'
                    ? 'border-white/10 text-slate-400 pointer-events-none opacity-60'
                    : 'border-gallery-gold text-gallery-gold hover:bg-gallery-gold hover:text-gallery-dark'
                }`}
              >
                {t('common.contactToBuy')}
              </a>

              <button
                onClick={onClose}
                className="flex-1 py-3 text-sm tracking-wider border rounded-[var(--radius-xl)] border-white/15 text-slate-100 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
