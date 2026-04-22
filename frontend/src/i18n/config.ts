import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

const LANGUAGE_STORAGE_KEY = 'locale';

const savedLocale = typeof window !== 'undefined' ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      mk: { translation: translations.mk },
    },
    lng: savedLocale === 'mk' ? 'mk' : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export { LANGUAGE_STORAGE_KEY };
export default i18n;
