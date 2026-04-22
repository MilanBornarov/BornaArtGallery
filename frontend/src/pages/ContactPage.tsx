import { useLanguage } from '../context/LanguageContext';

const facebookLink = import.meta.env.VITE_PUBLIC_FACEBOOK_LINK || '<FACEBOOK_LINK>';
const instagramLink = import.meta.env.VITE_PUBLIC_INSTAGRAM_LINK || '<INSTAGRAM_LINK>';
const phoneLink = import.meta.env.VITE_PUBLIC_PHONE_LINK || '<PHONE_LINK>';
const phoneDisplay = import.meta.env.VITE_PUBLIC_PHONE_DISPLAY || '<PHONE_DISPLAY>';

const contactItems = [
  {
    key: 'facebook',
    href: facebookLink,
    value: facebookLink.replace(/^https?:\/\//, ''),
  },
  {
    key: 'instagram',
    href: instagramLink,
    value: instagramLink.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, ''),
  },
  {
    key: 'phone',
    href: phoneLink,
    value: phoneDisplay,
  },
] as const;

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <main className="page-shell max-w-5xl mx-auto py-12">
      <section className="glass-panel relative overflow-hidden p-6 md:p-8 lg:p-10">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="absolute top-4 right-4 h-12 w-12 md:h-14 md:w-14 object-contain opacity-80 pointer-events-none"
        />
        <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gallery-gold">
          {t('contact.overline')}
        </p>
        <h1 className="section-title mt-2 mb-4">{t('contact.title')}</h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-300">
          {t('contact.intro')}
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {contactItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              target={item.key === 'phone' ? undefined : '_blank'}
              rel={item.key === 'phone' ? undefined : 'noreferrer'}
              className="contact-card group"
            >
              <span className="text-[0.72rem] uppercase tracking-[0.3em] text-gallery-gold">
                {t(`contact.items.${item.key}.label`)}
              </span>
              <span className="mt-4 block font-serif text-2xl text-white transition-transform duration-300 group-hover:translate-x-1">
                {item.value}
              </span>
              <span className="mt-3 inline-flex text-sm text-slate-300">
                {t('contact.openLink')}
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
