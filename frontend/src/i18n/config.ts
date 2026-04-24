import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

const LANGUAGE_STORAGE_KEY = 'locale';

function resolveSavedLocale() {
  if (typeof window === 'undefined') {
    return 'mk';
  }

  try {
    const savedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLocale === 'en' || savedLocale === 'mk' ? savedLocale : 'mk';
  } catch {
    return 'mk';
  }
}

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      mk: { translation: translations.mk },
    },
    lng: resolveSavedLocale(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export { LANGUAGE_STORAGE_KEY };
export default i18n;
