import { Link } from 'react-router-dom';
import type { Artwork } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import { getArtworkCategory, getArtworkDescription, getArtworkTitle, getStatusLabel } from '../i18n/helpers';
import { normalizeExternalUrl, pickConfiguredValue } from '../utils/contactLinks';

const FACEBOOK_LINK = normalizeExternalUrl(
  pickConfiguredValue(import.meta.env.VITE_PUBLIC_FACEBOOK_LINK, import.meta.env.VITE_FACEBOOK_LINK),
);

interface Props {
  artwork: Artwork;
  onClick: () => void;
  showFavorite?: boolean;
}

export default function ArtworkCard({ artwork, onClick, showFavorite = true }: Props) {
  const { isLoggedIn } = useAuth();
  const { isFav, toggle } = useFavorites();
  const { locale, t } = useLanguage();
  const favorited = isFav(artwork.id);
  const title = getArtworkTitle(artwork, locale);
  const category = getArtworkCategory(artwork, locale);
  const description = getArtworkDescription(artwork, locale);
  const buyLink = normalizeExternalUrl(artwork.facebookLink) || FACEBOOK_LINK;
  const contactButtonClass =
    'mb-4 mt-4 flex w-full items-center justify-center rounded-[var(--radius-xl)] border border-gallery-gold px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-gallery-gold transition-colors duration-300 hover:bg-gallery-gold hover:text-gallery-dark';

  return (
    <div
      className="card-artwork group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="card-img-wrap relative aspect-[4/3]">
        <img
          src={artwork.imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />

        {artwork.featured && (
          <span className="absolute top-3 left-3 bg-gallery-gold text-gallery-dark text-[0.625rem] tracking-widest uppercase px-2.5 py-1 font-medium rounded-[var(--radius-pill)]">
            {t('common.featured')}
          </span>
        )}

        <span
          className={`absolute bottom-3 left-3 status-badge-glass text-[0.625rem] tracking-widest uppercase px-2.5 py-1 font-medium ${
            artwork.status === 'SOLD' ? 'status-badge-sold' : 'status-badge-available'
          }`}
        >
          {getStatusLabel(artwork.status, locale)}
        </span>

        {isLoggedIn && showFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle(artwork.id);
            }}
            className={`absolute top-3 right-3 favorite-action-btn w-10 h-10 flex items-center justify-center transition-all duration-200 ${
              favorited ? 'favorite-action-btn-active' : 'favorite-action-btn-idle'
            }`}
            aria-label={favorited ? t('artwork.removeFavorite') : t('artwork.addFavorite')}
            title={favorited ? t('artwork.removeFavorite') : t('artwork.addFavorite')}
          >
            <span className="favorite-action-btn-icon" aria-hidden="true">
              {favorited ? '\u2665' : '\u2661'}
            </span>
          </button>
        )}
      </div>

      <div className="p-5 lg:p-6">
        {artwork.status === 'SOLD' ? (
          <span className={`${contactButtonClass} pointer-events-none opacity-60`}>
            {t('common.contactToBuy')}
          </span>
        ) : buyLink ? (
          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className={contactButtonClass}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {t('common.contactToBuy')}
          </a>
        ) : (
          <Link
            to="/contact"
            className={contactButtonClass}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {t('common.contactToBuy')}
          </Link>
        )}

        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-serif text-xl text-slate-50 leading-snug">{title}</h3>
          {artwork.year && (
            <span className="text-xs text-slate-300 whitespace-nowrap">{artwork.year}</span>
          )}
        </div>

        {category && (
          <p className="text-[0.625rem] tracking-[0.25em] uppercase text-gallery-gold mb-3">
            {category}
          </p>
        )}

        {description && (
          <p className="text-sm text-slate-300 text-pre-wrap line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}

        {artwork.width != null && artwork.height != null && (
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-400">
            {t('artwork.size')}: {t('artwork.sizeValue', { width: artwork.width, height: artwork.height })}
          </p>
        )}
      </div>
    </div>
  );
}
