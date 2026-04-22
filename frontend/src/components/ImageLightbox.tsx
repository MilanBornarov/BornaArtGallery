import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  imageSrc: string;
  imageAlt: string;
  title: string;
  onClose: () => void;
}

export default function ImageLightbox({ imageSrc, imageAlt, title, onClose }: Props) {
  const { t } = useLanguage();

  useEffect(() => {
    document.body.classList.add('modal-open');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-[var(--radius-pill)] border border-white/15 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/85 transition-colors duration-200 hover:bg-black/55 hover:text-white"
        >
          {t('common.close')}
        </button>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 shadow-[0_2rem_5rem_rgba(0,0,0,0.38)]">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
            <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gallery-gold">
              {title}
            </p>
          </div>

          <div className="p-4 md:p-6">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="mx-auto max-h-[80vh] w-auto max-w-full rounded-[1.4rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
