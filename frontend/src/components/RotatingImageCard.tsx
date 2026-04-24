import { memo, useEffect, useMemo, useState } from 'react';
import type { LightboxPayload } from './ImageLightbox';

interface Props {
  images: readonly string[];
  label: string;
  onOpen: (payload: LightboxPayload) => void;
}

const ROTATION_INTERVAL_MS = 3800;

function RotatingImageCard({ images, label, onOpen }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = useMemo(
    () =>
      images.map((src, index) => ({
        src,
        alt: `${label} ${index + 1}`,
        title: `${label} ${index + 1}`,
        eyebrow: label,
      })),
    [images, label],
  );

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [images.length, isPaused]);

  return (
    <button
      type="button"
      onClick={() =>
        onOpen({
          items: slides,
          initialIndex: activeIndex,
          galleryTitle: label,
          showDetails: false,
        })
      }
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="glass-card w-full p-4 text-left group cursor-zoom-in"
      aria-label={`Open ${label}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-xl)-0.35rem)] bg-white/5 mb-4">
        {images.map((imageSrc, index) => (
          <img
            key={imageSrc}
            src={imageSrc}
            alt={`${label} ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-3">
          <span className="text-wrap-safe max-w-[70%] text-[0.66rem] leading-5 tracking-[0.24em] uppercase text-white/85 sm:text-[0.68rem]">
            {label}
          </span>
          <span className="inline-flex items-center justify-center min-w-[2.8rem] rounded-[var(--radius-pill)] border border-white/20 bg-black/35 px-2.5 py-1 text-[0.62rem] tracking-[0.2em] text-white/85">
            {activeIndex + 1}/{images.length}
          </span>
        </div>
      </div>

      <p className="text-wrap-safe text-[0.68rem] uppercase leading-5 tracking-[0.22em] text-slate-300 transition-colors duration-300 group-hover:text-white">
        {label}
      </p>
    </button>
  );
}

export default memo(RotatingImageCard);
