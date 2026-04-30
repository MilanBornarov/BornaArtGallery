import { useEffect, useState } from 'react';

const SHOW_AFTER_PX = 360;

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > SHOW_AFTER_PX);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-[calc(env(safe-area-inset-right)+1rem)] z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-950/55 text-[#f6f0e8] shadow-[0_0.8rem_1.8rem_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-gallery-gold/60 hover:bg-slate-900/70 hover:text-gallery-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gallery-gold/55 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:bottom-7 sm:right-7 sm:h-11 sm:w-11 ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
