import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  ARTIST_FACEBOOK_URL,
  normalizeEmailUrl,
  normalizeExternalUrl,
  normalizePhoneUrl,
  pickConfiguredValue,
} from '../utils/contactLinks';

export default function ContactPage() {
  const { t } = useLanguage();

  const contactItems = useMemo(
    () =>
      [
        {
          key: 'facebook',
          href: ARTIST_FACEBOOK_URL,
          title: t('contact.items.facebook.title'),
          description: t('contact.items.facebook.description'),
          cta: t('contact.items.facebook.cta'),
        },
        {
          key: 'instagram',
          href: normalizeExternalUrl(
            pickConfiguredValue(import.meta.env.VITE_PUBLIC_INSTAGRAM_LINK, import.meta.env.VITE_INSTAGRAM_LINK),
          ),
          title: t('contact.items.instagram.title'),
          description: t('contact.items.instagram.description'),
          cta: t('contact.items.instagram.cta'),
        },
        {
          key: 'email',
          href: normalizeEmailUrl(
            pickConfiguredValue(
              import.meta.env.VITE_PUBLIC_EMAIL_LINK,
              import.meta.env.VITE_PUBLIC_EMAIL_ADDRESS,
              import.meta.env.VITE_EMAIL_LINK,
              import.meta.env.VITE_EMAIL_ADDRESS,
            ),
          ),
          title: t('contact.items.email.title'),
          description: t('contact.items.email.description'),
          cta: t('contact.items.email.cta'),
        },
        {
          key: 'phone',
          href: normalizePhoneUrl(
            pickConfiguredValue(import.meta.env.VITE_PUBLIC_PHONE_LINK, import.meta.env.VITE_PHONE_LINK),
            pickConfiguredValue(import.meta.env.VITE_PUBLIC_PHONE_DISPLAY, import.meta.env.VITE_PHONE_DISPLAY),
          ),
          title: t('contact.items.phone.title'),
          description: t('contact.items.phone.description'),
          cta: t('contact.items.phone.cta'),
        },
      ].filter((item): item is {
        key: string;
        href: string;
        title: string;
        description: string;
        cta: string;
      } => Boolean(item.href)),
    [t],
  );

  return (
    <main className="page-shell max-w-6xl mx-auto py-12">
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
        <p className="text-wrap-safe max-w-2xl text-sm leading-7 text-slate-300">
          {t('contact.intro')}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-fr xl:gap-6">
          {contactItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              target={item.key === 'phone' || item.key === 'email' ? undefined : '_blank'}
              rel={item.key === 'phone' || item.key === 'email' ? undefined : 'noopener noreferrer'}
              className="contact-card group"
            >
              <div className="contact-card-copy">
                <span className="contact-card-kicker">{item.title}</span>
                <h2 className="contact-card-title">
                  {item.cta}
                </h2>
                <p className="contact-card-description">
                  {item.description}
                </p>
              </div>

              <span className="contact-card-link">
                <span>{t('contact.openLink')}</span>
                <span aria-hidden="true">&rarr;</span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
