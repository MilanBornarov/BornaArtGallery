import type { Artwork } from '../types';
import type { Locale } from './types';

const CATEGORY_LABELS: Record<string, { en: string; mk: string }> = {
  landscapes: { en: 'Landscapes', mk: 'Пејзажи' },
  abstract: { en: 'Abstract', mk: 'Апстрактни' },
  floral: { en: 'Floral', mk: 'Цвеќе / Флорални' },
  animals: { en: 'Animals', mk: 'Животни / Фауна' },
  figurative: { en: 'Figurative', mk: 'Фигуративни' },
  boats: { en: 'Boats', mk: 'Бродови' },
  frames: { en: 'Frames', mk: 'Рамки' },
  uncategorised: { en: 'Uncategorised', mk: 'Некатегоризирано' },
};

function normalizeCategoryKey(value?: string | null) {
  return (value || '').toLowerCase().replace(/[^a-z]/g, '');
}

function pickLocalizedValue(locale: Locale, mk?: string | null, en?: string | null, fallback?: string | null) {
  if (locale === 'mk') return mk || en || fallback || '';
  return en || mk || fallback || '';
}

export function getArtworkTitle(artwork: Artwork, locale: Locale) {
  return pickLocalizedValue(locale, artwork.titleMk, artwork.titleEn, artwork.title);
}

export function getArtworkDescription(artwork: Artwork, locale: Locale) {
  return pickLocalizedValue(locale, artwork.descriptionMk, artwork.descriptionEn, artwork.description);
}

export function getCategoryLabel(value: string | undefined | null, locale: Locale) {
  if (!value) return locale === 'mk' ? 'Некатегоризирано' : 'Uncategorised';
  const known = CATEGORY_LABELS[normalizeCategoryKey(value)];
  return known ? known[locale] : value;
}

export function getArtworkCategory(artwork: Artwork, locale: Locale) {
  if (artwork.categorySlug && CATEGORY_LABELS[normalizeCategoryKey(artwork.categorySlug)]) {
    return CATEGORY_LABELS[normalizeCategoryKey(artwork.categorySlug)][locale];
  }

  return pickLocalizedValue(
    locale,
    artwork.categoryMk,
    artwork.categoryEn,
    artwork.category ? getCategoryLabel(artwork.category, locale) : '',
  );
}

export function getStatusLabel(status: Artwork['status'], locale: Locale) {
  if (locale === 'mk') {
    return status === 'SOLD' ? 'Продадено' : 'Достапно';
  }
  return status === 'SOLD' ? 'Sold' : 'Available';
}

export function getWorksLabel(count: number, locale: Locale) {
  if (locale === 'mk') {
    return count === 1 ? 'дело' : 'дела';
  }
  return count === 1 ? 'work' : 'works';
}
