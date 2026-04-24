import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useModalHistoryClose } from '../hooks/useModalHistoryClose';

export interface LightboxItem {
  src: string;
  alt: string;
  title: string;
  description?: string;
  eyebrow?: string;
}

export interface LightboxPayload {
  items: LightboxItem[];
  initialIndex?: number;
  galleryTitle?: string;
  showDetails?: boolean;
}

interface Props extends LightboxPayload {
  onClose: () => void;
}

const DRAG_AXIS_LOCK_THRESHOLD = 8;

function clampIndex(index: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  if (index < 0) {
    return 0;
  }

  if (index >= total) {
    return total - 1;
  }

  return index;
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={
          direction === 'left'
            ? 'M14.5 5.5 8.5 12l6 6.5'
            : 'M9.5 5.5 15.5 12l-6 6.5'
        }
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ImageLightbox({
  items,
  initialIndex = 0,
  galleryTitle,
  showDetails = true,
  onClose,
}: Props) {
  const { t } = useLanguage();
  const requestClose = useModalHistoryClose(onClose, 'image-lightbox');
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(() => clampIndex(initialIndex, items.length));
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const dragAxis = useRef<'x' | 'y' | null>(null);

  const canNavigate = items.length > 1;
  const currentItem = items[activeIndex];

  useBodyScrollLock(true, [modalRef]);

  useEffect(() => {
    setActiveIndex(clampIndex(initialIndex, items.length));
    setDragOffset(0);
    setIsDragging(false);
    dragOffsetRef.current = 0;
  }, [initialIndex, items]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose();
        return;
      }

      if (!canNavigate) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current - 1 + items.length) % items.length);
      }

      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current + 1) % items.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canNavigate, items.length, requestClose]);

  if (!currentItem) {
    return null;
  }

  const resetDrag = () => {
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsDragging(false);
  };

  const goPrev = () => {
    if (!canNavigate) {
      return;
    }

    resetDrag();
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  };

  const goNext = () => {
    if (!canNavigate) {
      return;
    }

    resetDrag();
    setActiveIndex((current) => (current + 1) % items.length);
  };

  const endTouchInteraction = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    dragAxis.current = null;
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!canNavigate) {
      return;
    }

    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
    dragAxis.current = null;
    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!canNavigate || touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    if (dragAxis.current === null) {
      if (Math.abs(deltaX) < DRAG_AXIS_LOCK_THRESHOLD && Math.abs(deltaY) < DRAG_AXIS_LOCK_THRESHOLD) {
        return;
      }

      dragAxis.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
    }

    if (dragAxis.current !== 'x') {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    dragOffsetRef.current = deltaX;
    setIsDragging(true);
    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (!canNavigate) {
      return;
    }

    const stageWidth = stageRef.current?.clientWidth ?? window.innerWidth;
    const dragThreshold = Math.min(110, Math.max(48, stageWidth * 0.12));

    if (Math.abs(dragOffsetRef.current) > dragThreshold) {
      if (dragOffsetRef.current < 0) {
        goNext();
      } else {
        goPrev();
      }
    } else {
      resetDrag();
    }

    endTouchInteraction();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overscroll-contain bg-black/88 p-3 backdrop-blur-md sm:p-5"
      onClick={requestClose}
      onTouchMoveCapture={(event) => {
        if (event.target === event.currentTarget && event.cancelable) {
          event.preventDefault();
        }
      }}
    >
      <div
        ref={modalRef}
        className="group relative w-full max-w-6xl overscroll-contain"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={galleryTitle || currentItem.title}
      >
        <div className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-[rgba(10,10,10,0.75)] shadow-[0_2rem_5rem_rgba(0,0,0,0.38)]">
          {showDetails ? (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
                <div className="min-w-0 space-y-2">
                  {galleryTitle ? (
                    <p className="text-[0.68rem] uppercase tracking-[0.3em] text-gallery-gold sm:text-[0.72rem]">
                      {galleryTitle}
                    </p>
                  ) : null}

                  <h2 className="text-wrap-safe font-serif text-xl leading-tight text-white sm:text-2xl">
                    {currentItem.title}
                  </h2>

                  {canNavigate ? (
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-300">
                      {activeIndex + 1}/{items.length}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={requestClose}
                  className="modal-close-btn shrink-0"
                >
                  {t('common.close')}
                </button>
              </div>

              <div className="grid min-h-0 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.68fr)]">
                <div
                  ref={stageRef}
                  className="relative flex min-h-[18rem] items-center justify-center overflow-hidden bg-black/25 px-4 py-4 sm:px-6 sm:py-6 xl:min-h-[34rem] xl:px-8"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  style={{ touchAction: canNavigate ? 'none' : 'auto' }}
                >
                  <img
                    src={currentItem.src}
                    alt={currentItem.alt}
                    decoding="async"
                    draggable={false}
                    className="mx-auto block h-auto w-auto max-w-full rounded-none object-contain"
                    style={{
                      maxHeight: 'min(74vh, calc(100dvh - 12rem))',
                      transform: isDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
                      transition: isDragging ? 'none' : 'transform 320ms ease',
                    }}
                  />

                  {canNavigate ? (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        className="carousel-nav-btn left-4 hidden pointer-events-none opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 lg:inline-flex"
                        aria-label={t('carousel.previousSlide')}
                      >
                        &larr;
                      </button>

                      <button
                        type="button"
                        onClick={goNext}
                        className="carousel-nav-btn right-4 hidden pointer-events-none opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 lg:inline-flex"
                        aria-label={t('carousel.nextSlide')}
                      >
                        &rarr;
                      </button>
                    </>
                  ) : null}
                </div>

                <div className="flex min-h-0 flex-col border-t border-white/10 p-4 sm:p-6 xl:max-h-[82vh] xl:border-l xl:border-t-0">
                  <div className="min-h-0 flex-1 overflow-y-auto pr-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {currentItem.eyebrow ? (
                      <p className="mb-3 text-[0.68rem] uppercase tracking-[0.3em] text-gallery-gold">
                        {currentItem.eyebrow}
                      </p>
                    ) : null}

                    {currentItem.description ? (
                      <p className="text-pre-wrap text-wrap-safe text-sm leading-7 text-slate-200">
                        {currentItem.description}
                      </p>
                    ) : (
                      <p className="text-wrap-safe text-sm leading-7 text-slate-300">
                        {currentItem.alt}
                      </p>
                    )}
                  </div>

                  {canNavigate ? (
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs uppercase tracking-[0.22em] text-slate-300">
                      <button type="button" onClick={goPrev} className="inline-flex items-center gap-2 hover:text-white">
                        <span aria-hidden="true">&larr;</span>
                        <span>{t('carousel.previousSlide')}</span>
                      </button>

                      <span>{activeIndex + 1}/{items.length}</span>

                      <button type="button" onClick={goNext} className="inline-flex items-center gap-2 hover:text-white">
                        <span>{t('carousel.nextSlide')}</span>
                        <span aria-hidden="true">&rarr;</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <div
              ref={stageRef}
              className="relative flex min-h-[22rem] items-center justify-center overflow-hidden bg-black/30 px-3 pb-24 pt-20 sm:px-5 sm:pb-28 sm:pt-24"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              style={{ touchAction: canNavigate ? 'none' : 'auto' }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-3 sm:p-5">
                <button
                  type="button"
                  onClick={requestClose}
                  className="modal-close-btn pointer-events-auto shrink-0"
                >
                  {t('common.close')}
                </button>
              </div>

              <img
                src={currentItem.src}
                alt={currentItem.alt}
                decoding="async"
                draggable={false}
                className="mx-auto block h-auto w-auto max-w-full rounded-none object-contain"
                style={{
                  maxHeight: 'calc(100dvh - 13.5rem)',
                  transform: isDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
                  transition: isDragging ? 'none' : 'transform 320ms ease',
                }}
              />

              {canNavigate ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 sm:p-5 lg:hidden">
                  <div className="pointer-events-auto inline-flex items-center gap-3 px-3.5 py-2.5">
                    <button
                      type="button"
                      onClick={goPrev}
                      className="modal-nav-btn"
                      aria-label={t('carousel.previousSlide')}
                    >
                      <ChevronIcon direction="left" />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      className="modal-nav-btn"
                      aria-label={t('carousel.nextSlide')}
                    >
                      <ChevronIcon direction="right" />
                    </button>
                  </div>
                </div>
              ) : null}

              {canNavigate ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="carousel-nav-btn left-4 hidden pointer-events-none opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 lg:inline-flex"
                    aria-label={t('carousel.previousSlide')}
                  >
                    <ChevronIcon direction="left" />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="carousel-nav-btn right-4 hidden pointer-events-none opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 lg:inline-flex"
                    aria-label={t('carousel.nextSlide')}
                  >
                    <ChevronIcon direction="right" />
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
