import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Artwork } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useLanguage } from '../context/LanguageContext';
import { useModalHistoryClose } from '../hooks/useModalHistoryClose';
import {
  getArtworkCategory,
  getArtworkDescription,
  getArtworkTitle,
  getStatusLabel,
} from '../i18n/helpers';
import { normalizeExternalUrl, pickConfiguredValue } from '../utils/contactLinks';

const FACEBOOK_LINK = normalizeExternalUrl(
  pickConfiguredValue(import.meta.env.VITE_PUBLIC_FACEBOOK_LINK, import.meta.env.VITE_FACEBOOK_LINK),
);

interface Props {
  artwork: Artwork;
  onClose: () => void;
  hideNavbar?: boolean;
}

export default function ArtworkModal({ artwork, onClose, hideNavbar = false }: Props) {
  const { isLoggedIn } = useAuth();
  const { isFav, toggle } = useFavorites();
  const { locale, t } = useLanguage();
  const requestClose = useModalHistoryClose(onClose, 'artwork-modal');
  const modalRef = useRef<HTMLDivElement | null>(null);
  const favorited = isFav(artwork.id);

  useBodyScrollLock(true, [modalRef]);

  useEffect(() => {
    if (!hideNavbar) {
      return;
    }

    document.body.classList.add('app-chrome-hidden');

    return () => {
      document.body.classList.remove('app-chrome-hidden');
    };
  }, [hideNavbar]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [requestClose]);

  const buyLink = normalizeExternalUrl(artwork.facebookLink) || FACEBOOK_LINK;
  const title = getArtworkTitle(artwork, locale);
  const category = getArtworkCategory(artwork, locale);
  const description = getArtworkDescription(artwork, locale);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-black/70 p-3 animate-fadeIn sm:p-4"
      onClick={requestClose}
      onTouchMoveCapture={(event) => {
        if (event.target === event.currentTarget && event.cancelable) {
          event.preventDefault();
        }
      }}
    >
      <div
        ref={modalRef}
        className="glass-panel relative w-full max-w-6xl !overflow-hidden animate-slideUp"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={requestClose}
          className="modal-close-btn absolute right-3 top-3 z-20 shrink-0 sm:right-4 sm:top-4"
        >
          {t('common.close')}
        </button>

        <div
          className="flex max-h-[90dvh] flex-col overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex shrink-0 items-center justify-center bg-gallery-dark px-4 pb-5 pt-16 sm:px-6 sm:pb-6 sm:pt-20 lg:px-8 lg:pb-8">
            <div className="flex w-full max-w-full flex-col items-center gap-4">
              <img
                src={artwork.imageUrl}
                alt={title}
                decoding="async"
                className="artwork-modal-image"
              />

              {artwork.status === 'SOLD' ? (
                <span className="w-full max-w-xs rounded-[var(--radius-xl)] border border-white/10 py-3 text-center text-sm tracking-wider text-slate-400 opacity-60 sm:max-w-sm">
                  {t('common.contactToBuy')}
                </span>
              ) : buyLink ? (
                <a
                  href={buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full max-w-xs rounded-[var(--radius-xl)] border border-gallery-gold py-3 text-center text-sm tracking-wider text-gallery-gold transition-colors duration-300 hover:bg-gallery-gold hover:text-gallery-dark sm:max-w-sm"
                >
                  {t('common.contactToBuy')}
                </a>
              ) : (
                <Link
                  to="/contact"
                  className="w-full max-w-xs rounded-[var(--radius-xl)] border border-gallery-gold py-3 text-center text-sm tracking-wider text-gallery-gold transition-colors duration-300 hover:bg-gallery-gold hover:text-gallery-dark sm:max-w-sm"
                >
                  {t('common.contactToBuy')}
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col border-t border-white/10 px-5 pb-5 pt-8 sm:px-7 sm:pb-7 sm:pt-10 lg:px-8 lg:pb-8">
            {category ? (
              <p className="text-wrap-safe mb-3 text-[0.625rem] tracking-[0.3em] uppercase text-gallery-gold">
                {category}
              </p>
            ) : null}

            <h2 className="text-wrap-safe mb-2 font-serif text-3xl font-normal leading-tight text-slate-50">
              {title}
            </h2>

            <p className="mb-2 text-sm text-slate-300">
              {t('artwork.artistLine')}
              {artwork.year ? ` \u00B7 ${artwork.year}` : ''}
            </p>

            {artwork.width != null && artwork.height != null ? (
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-400">
                {t('artwork.size')}: {t('artwork.sizeValue', { width: artwork.width, height: artwork.height })}
              </p>
            ) : null}

            <p
              className={`mb-6 inline-block self-start status-badge-glass px-2.5 py-1 text-[0.625rem] tracking-widest uppercase ${
                artwork.status === 'SOLD' ? 'status-badge-sold' : 'status-badge-available'
              }`}
            >
              {getStatusLabel(artwork.status, locale)}
            </p>

            <div className="mb-6 h-px w-10 bg-gallery-gold" />

            {description ? (
              <p className="text-pre-wrap text-wrap-safe pb-2 text-sm leading-7 text-slate-200">
                {description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
              {isLoggedIn ? (
                <button
                  onClick={() => toggle(artwork.id)}
                  className={`w-full py-3 text-sm tracking-wider transition-all duration-300 border rounded-[var(--radius-xl)] ${
                    favorited
                      ? 'border-gallery-gold/70 bg-gallery-gold/15 text-gallery-cream shadow-[0_0_0_1px_rgba(245,202,72,0.22),0_1rem_2rem_rgba(201,168,76,0.14)]'
                      : 'border-white/15 text-slate-50 hover:border-gallery-gold/60 hover:bg-white/10'
                  }`}
                >
                  {favorited ? `\u2665 ${t('artwork.savedAction')}` : `\u2661 ${t('artwork.saveAction')}`}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
