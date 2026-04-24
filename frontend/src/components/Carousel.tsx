import { useEffect, useMemo, useRef, useState } from 'react';
import type { Artwork } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getArtworkTitle } from '../i18n/helpers';

interface Props {
  artworks: Artwork[];
}

const AUTO_ADVANCE_DELAY = 7200;
const DRAG_AXIS_LOCK_THRESHOLD = 8;

export default function Carousel({ artworks }: Props) {
  const { locale, t } = useLanguage();
  const [currentGroup, setCurrentGroup] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shellRef = useRef<HTMLElement | null>(null);
  const dragOffsetRef = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const dragAxis = useRef<'x' | 'y' | null>(null);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const itemsPerView = isDesktop ? 2 : 1;

  const groups = useMemo(() => {
    const result: Artwork[][] = [];
    for (let index = 0; index < artworks.length; index += itemsPerView) {
      result.push(artworks.slice(index, index + itemsPerView));
    }
    return result;
  }, [artworks, itemsPerView]);

  useEffect(() => {
    if (currentGroup >= groups.length) {
      setCurrentGroup(0);
    }
  }, [currentGroup, groups.length]);

  const clearAutoAdvance = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (groups.length <= 1 || isPaused || isDragging) {
      clearAutoAdvance();
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setCurrentGroup((prev) => (prev + 1) % groups.length);
    }, AUTO_ADVANCE_DELAY);

    return clearAutoAdvance;
  }, [currentGroup, groups.length, isDragging, isPaused]);

  if (!artworks.length) return null;

  const resetDrag = () => {
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsDragging(false);
  };

  const goTo = (index: number) => {
    clearAutoAdvance();
    resetDrag();
    setCurrentGroup(index);
  };

  const goPrev = () => {
    clearAutoAdvance();
    resetDrag();
    setCurrentGroup((prev) => (prev - 1 + groups.length) % groups.length);
  };

  const goNext = () => {
    clearAutoAdvance();
    resetDrag();
    setCurrentGroup((prev) => (prev + 1) % groups.length);
  };

  const endTouchInteraction = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    dragAxis.current = null;
    setIsPaused(false);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    clearAutoAdvance();
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
    dragAxis.current = null;
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsPaused(true);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

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

    if (dragAxis.current !== 'x') return;

    dragOffsetRef.current = deltaX;
    setIsDragging(true);
    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) {
      endTouchInteraction();
      return;
    }

    if (dragAxis.current === 'x') {
      const shellWidth = shellRef.current?.clientWidth ?? window.innerWidth;
      const dragThreshold = Math.min(96, Math.max(52, shellWidth * 0.1));

      if (Math.abs(dragOffsetRef.current) > dragThreshold) {
        dragOffsetRef.current < 0 ? goNext() : goPrev();
      } else {
        resetDrag();
      }
    } else {
      resetDrag();
    }

    endTouchInteraction();
  };

  const sliderTransform = isDragging
    ? `translate3d(calc(-${currentGroup * 100}% + ${dragOffset}px), 0, 0)`
    : `translate3d(-${currentGroup * 100}%, 0, 0)`;

  return (
    <section
      ref={shellRef}
      className="carousel-shell"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setHoverSide(null);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className="carousel-slider"
        style={{
          transform: sliderTransform,
          transitionDuration: isDragging ? '0ms' : undefined,
        }}
      >
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="carousel-slide-group">
            <div className="relative h-full w-full">
              <div className={`grid h-full w-full ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {group.map((art, index) => (
                  <div key={art.id} className="carousel-pane">
                    <img
                      src={art.imageUrl}
                      alt={getArtworkTitle(art, locale)}
                      decoding="async"
                      className="w-full h-full object-cover"
                      loading={groupIndex === 0 && index === 0 ? 'eager' : 'lazy'}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                    <div className="carousel-edge-fade-left" />
                    <div className="carousel-edge-fade-right" />

                    <div
                      className={`absolute bottom-[6%] z-10 max-w-[72%] ${
                        isDesktop && index === 1 ? 'right-[5%] text-right' : 'left-[5%] text-left'
                      }`}
                    >
                      <p className="text-gallery-gold text-[0.625rem] md:text-xs tracking-[0.28em] uppercase mb-2">
                        {t('carousel.featuredWork')}
                      </p>
                      <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl text-white leading-tight text-pre-wrap">
                        {getArtworkTitle(art, locale)}
                      </h2>
                      <p className="text-white/75 text-sm md:text-base mt-1 text-pre-wrap">
                        {t('artwork.artistLine')}
                        {art.year ? `, ${art.year}` : ''}
                      </p>
                    </div>
                  </div>
                ))}

                {isDesktop && group.length === 1 && (
                  <div className="carousel-pane bg-slate-950/70" />
                )}
              </div>

              {isDesktop && group.length === 2 && <div className="carousel-center-softener" aria-hidden="true" />}
            </div>
          </div>
        ))}
      </div>

      {groups.length > 1 && (
        <>
          <div
            className="carousel-hit-left hidden lg:block"
            onMouseEnter={() => setHoverSide('left')}
            onClick={goPrev}
            aria-hidden="true"
          />
          <div
            className="carousel-hit-right hidden lg:block"
            onMouseEnter={() => setHoverSide('right')}
            onClick={goNext}
            aria-hidden="true"
          />

          <button
            onClick={goPrev}
            className={`carousel-nav-btn carousel-nav-left hidden lg:inline-flex ${
              hoverSide === 'left' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            aria-label={t('carousel.previousSlide')}
          >
            &larr;
          </button>

          <button
            onClick={goNext}
            className={`carousel-nav-btn carousel-nav-right hidden lg:inline-flex ${
              hoverSide === 'right' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            aria-label={t('carousel.nextSlide')}
          >
            &rarr;
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {groups.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === currentGroup ? 'bg-gallery-gold w-6' : 'bg-white/40 w-2'
                }`}
                aria-label={t('carousel.goToSlide', { index: index + 1 })}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
