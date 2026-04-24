import { useEffect, useMemo, useRef, useState } from 'react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useLanguage } from '../context/LanguageContext';

type FrameStyle = 'classic' | 'black' | 'gallery' | 'walnut' | 'floating';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FramePreviewModal({ isOpen, onClose }: Props) {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeFrame, setActiveFrame] = useState<FrameStyle>('classic');
  const panelRef = useRef<HTMLDivElement | null>(null);

  useBodyScrollLock(isOpen, [panelRef]);

  const frameOptions: { value: FrameStyle; label: string }[] = [
    { value: 'classic', label: t('framePreview.classicGold') },
    { value: 'black', label: t('framePreview.blackModern') },
    { value: 'gallery', label: t('framePreview.galleryWhite') },
    { value: 'walnut', label: t('framePreview.walnutWood') },
    { value: 'floating', label: t('framePreview.floatingShadow') },
  ];

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const frameClass = useMemo(() => {
    switch (activeFrame) {
      case 'black':
        return 'frame-style-black';
      case 'gallery':
        return 'frame-style-gallery';
      case 'walnut':
        return 'frame-style-walnut';
      case 'floating':
        return 'frame-style-floating';
      default:
        return 'frame-style-classic';
    }
  }, [activeFrame]);

  if (!isOpen) return null;

  return (
    <div
      className="frame-modal-shell"
      onClick={onClose}
      onTouchMoveCapture={(event) => {
        if (event.target === event.currentTarget && event.cancelable) {
          event.preventDefault();
        }
      }}
    >
      <div ref={panelRef} className="frame-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[32%] flex flex-col gap-4">
            <div>
              <p className="text-[0.625rem] tracking-[0.28em] uppercase text-gallery-gold mb-2">
                {t('framePreview.overline')}
              </p>
              <h2 className="section-title text-2xl md:text-3xl">
                {t('framePreview.title')}
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                {t('framePreview.intro')}
              </p>
            </div>

            <label className="btn-glass text-center">
              <span>{t('common.chooseImage')}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSelectedImage((current) => {
                    if (current) {
                      URL.revokeObjectURL(current);
                    }
                    return URL.createObjectURL(file);
                  });
                }}
              />
            </label>

            <div className="frame-grid">
              {frameOptions.map((frame) => (
                <button
                  key={frame.value}
                  type="button"
                  onClick={() => setActiveFrame(frame.value)}
                  className={`frame-style-btn ${activeFrame === frame.value ? 'frame-style-btn-active' : ''}`}
                >
                  <span className={`text-sm ${activeFrame === frame.value ? 'text-white' : 'text-slate-200'}`}>{frame.label}</span>
                  <span className={`text-xs ${activeFrame === frame.value ? 'text-slate-100' : 'text-slate-400'}`}>{t('common.previewStyle')}</span>
                </button>
              ))}
            </div>

            <button type="button" onClick={onClose} className="btn-glass">
              {t('common.close')}
            </button>
          </div>

          <div className="lg:w-[68%]">
            <div className="frame-preview-shell">
              {selectedImage ? (
                <div className={frameClass}>
                  <img src={selectedImage} alt={t('framePreview.framePreviewAlt')} className="frame-preview-art" />
                </div>
              ) : (
                <div className="text-center text-slate-300">
                  <p className="font-serif text-xl italic mb-2 text-slate-50">{t('common.noImageSelected')}</p>
                  <p className="text-sm">{t('framePreview.uploadPrompt')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
