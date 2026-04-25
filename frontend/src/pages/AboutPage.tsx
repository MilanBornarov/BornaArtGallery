import { Link } from 'react-router-dom';
import FadeInImage from '../components/FadeInImage';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

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
    </main>
  );
}
