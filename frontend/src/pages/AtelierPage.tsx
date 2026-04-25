import { useState } from 'react';
import ImageLightbox from '../components/ImageLightbox';
import ProcessSteps from '../components/ProcessSteps';
import RotatingImageCard from '../components/RotatingImageCard';
import { useLanguage } from '../context/LanguageContext';
import type { LightboxPayload } from '../components/ImageLightbox';

const atelierGallery = [
  {
    key: 'colors',
    images: ['/Colors/Color1.jpg', '/Colors/Color2.jpg', '/Colors/Color3.jpg'],
  },
  {
    key: 'studio',
    images: ['/Atelier/Atelier1.jpg', '/Atelier/Atelier2.jpg', '/Atelier/Atelier3.jpg'],
  },
  {
    key: 'tools',
    images: ['/Tools/Tools1.jpg', '/Tools/Tools2.jpg', '/Tools/Tools3.jpg'],
  },
  {
    key: 'canvases',
    images: ['/Canvases/Canvas1.jpg', '/Canvases/Canvas2.jpg', '/Canvases/Canvas3.jpg', '/Canvases/Canvas4.jpg'],
  },
  {
    key: 'frames',
    images: ['/Frames/Frame_1.jpg', '/Frames/Frame_2.jpg'],
  },
] as const;

export default function AtelierPage() {
  const { t } = useLanguage();
  const [lightbox, setLightbox] = useState<LightboxPayload | null>(null);

  return (
    <main className="page-shell max-w-6xl mx-auto py-12">
      <section className="glass-panel p-6 md:p-8">
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gallery-gold">
            {t('about.studioOverline')}
          </p>
          <h1 className="font-serif text-3xl text-white mt-2">{t('about.studioTitle')}</h1>
        </div>

        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-5">
          {atelierGallery.map((item) => (
            <div key={item.key} className="w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
              <RotatingImageCard
                images={item.images}
                label={t(`about.gallery.${item.key}`)}
                onOpen={setLightbox}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 glass-panel p-6 md:p-8">
        <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gallery-gold">
          {t('about.statementOverline')}
        </p>
        <h2 className="font-serif text-3xl text-white mt-2 mb-5">{t('about.statementTitle')}</h2>
        <div className="space-y-5 text-sm leading-8 text-slate-200">
          <p>{t('about.statementParagraph1')}</p>
          <p>{t('about.statementParagraph2')}</p>
        </div>
      </section>

      <ProcessSteps onOpenImage={setLightbox} />

      {lightbox ? (
        <ImageLightbox
          items={lightbox.items}
          initialIndex={lightbox.initialIndex}
          galleryTitle={lightbox.galleryTitle}
          showDetails={false}
          hideNavbar
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </main>
  );
}
