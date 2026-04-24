import { useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n, { LANGUAGE_STORAGE_KEY } from '../i18n/config';
import type { Locale } from '../i18n/types';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = i18n.language === 'mk' ? 'mk' : 'en';
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function useLanguage(): LanguageContextValue {
  const { t, i18n: i18nInstance } = useTranslation();
  const locale: Locale = i18nInstance.language === 'mk' ? 'mk' : 'en';

  const setLocale = useCallback((nextLocale: Locale) => {
    void i18nInstance.changeLanguage(nextLocale);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
    } catch {
      // Ignore storage write failures and keep the in-memory locale change.
    }
    document.documentElement.lang = nextLocale;
  }, [i18nInstance]);

  const translate = useCallback((key: string, params?: Record<string, string | number>) => t(key, params), [t]);

  return useMemo(() => ({
    locale,
    setLocale,
    toggleLocale: () => setLocale(locale === 'en' ? 'mk' : 'en'),
    t: translate,
  }), [locale, setLocale, translate]);
}
