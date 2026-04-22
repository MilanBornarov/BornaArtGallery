import { useEffect, useState } from 'react';

interface Props {
  images: readonly string[];
  label: string;
  onOpen: (src: string, alt: string, title: string) => void;
}

const ROTATION_INTERVAL_MS = 2000;

export default function RotatingImageCard({ images, label, onOpen }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [images.length, isPaused]);

  const currentSrc = images[activeIndex];
  const currentAlt = `${label} ${activeIndex + 1}`;

  return (
    <button
      type="button"
      onClick={() => onOpen(currentSrc, currentAlt, label)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="glass-card w-full p-4 text-left group cursor-zoom-in"
      aria-label={`Open ${currentAlt}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-xl)-0.35rem)] bg-white/5 mb-4">
        {images.map((imageSrc, index) => (
          <img
            key={imageSrc}
            src={imageSrc}
            alt={`${label} ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-3">
          <span className="text-[0.68rem] tracking-[0.28em] uppercase text-white/85">
            {label}
          </span>
          <span className="inline-flex items-center justify-center min-w-[2.8rem] rounded-[var(--radius-pill)] border border-white/20 bg-black/35 px-2.5 py-1 text-[0.62rem] tracking-[0.2em] text-white/85">
            {activeIndex + 1}/{images.length}
          </span>
        </div>
      </div>

      <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-300 group-hover:text-white transition-colors duration-300">
        {label}
      </p>
    </button>
  );
}
