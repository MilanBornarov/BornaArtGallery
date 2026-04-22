import { useState } from 'react';
import { Link } from 'react-router-dom';
import FadeInImage from '../components/FadeInImage';
import ImageLightbox from '../components/ImageLightbox';
import ProcessSteps from '../components/ProcessSteps';
import RotatingImageCard from '../components/RotatingImageCard';
import { useLanguage } from '../context/LanguageContext';

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
] as const;

export default function AboutPage() {
  const { t } = useLanguage();
  const [expandedImage, setExpandedImage] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);

  return (
    <main className="page-shell max-w-6xl mx-auto py-12">
      <section className="glass-panel relative overflow-hidden">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="hidden sm:block absolute top-4 right-4 h-12 w-12 md:h-14 md:w-14 object-contain opacity-80 pointer-events-none"
        />
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8 p-6 md:p-8 lg:p-10">
          <div className="flex justify-center lg:justify-start">
            <div className="about-photo-frame">
              <FadeInImage
                src="/artist.jpg"
                alt={t('about.photoAlt')}
                className="h-full w-full rounded-[inherit] object-cover"
              />
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gallery-gold">
              {t('about.overline')}
            </p>
            <h1 className="section-title">{t('about.title')}</h1>
            <div className="space-y-4 text-sm leading-7 text-slate-200">
              <p>{t('about.paragraph1')}</p>
              <p>{t('about.paragraph2')}</p>
              <p>{t('about.paragraph3')}</p>
              <p>{t('about.paragraph4')}</p>
              <p className="text-gallery-gold">{t('about.paragraph5')}</p>
            </div>
            <Link to="/gallery" className="btn-glass-gold mt-2 inline-flex">
              {t('about.viewGallery')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 glass-panel p-6 md:p-8">
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gallery-gold">
            {t('about.studioOverline')}
          </p>
          <h2 className="font-serif text-3xl text-white mt-2">{t('about.studioTitle')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {atelierGallery.map((item) => (
            <RotatingImageCard
              key={item.key}
              images={item.images}
              label={t(`about.gallery.${item.key}`)}
              onOpen={(src, alt, title) => setExpandedImage({ src, alt, title })}
            />
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

      <ProcessSteps onOpenImage={(src, alt, title) => setExpandedImage({ src, alt, title })} />

      {expandedImage ? (
        <ImageLightbox
          imageSrc={expandedImage.src}
          imageAlt={expandedImage.alt}
          title={expandedImage.title}
          onClose={() => setExpandedImage(null)}
        />
      ) : null}
    </main>
  );
}
