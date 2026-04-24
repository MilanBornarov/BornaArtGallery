import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { apiFilterArtworks, apiGetArtworks, type ArtworkFilterParams } from '../services/api';
import type { Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import ArtworkModal from '../components/ArtworkModal';
import FramePreviewModal from '../components/FramePreviewModal';
import { GridSkeleton } from '../components/LoadingSkeleton';
import CustomDropdown from '../components/CustomDropdown';
import { useLanguage } from '../context/LanguageContext';
import { getArtworkCategory, getArtworkTitle, getWorksLabel } from '../i18n/helpers';

type OrientationFilter = 'all' | 'square' | 'portrait' | 'landscape';

type DimensionInputs = {
  exactWidth: string;
  exactHeight: string;
  minWidth: string;
  maxWidth: string;
  minHeight: string;
  maxHeight: string;
  orientation: OrientationFilter;
};

const defaultDimensions: DimensionInputs = {
  exactWidth: '',
  exactHeight: '',
  minWidth: '',
  maxWidth: '',
  minHeight: '',
  maxHeight: '',
  orientation: 'all',
};

const orientationKeys: OrientationFilter[] = ['all', 'square', 'portrait', 'landscape'];

function hasDimensionValues(params: ArtworkFilterParams) {
  return Object.entries(params).some(([key, value]) => key !== 'orientation' && key !== 'square' && value !== undefined);
}

function hasActiveDimensionFilters(params: ArtworkFilterParams) {
  return Object.values(params).some((value) => value !== undefined);
}

export default function GalleryPage() {
  const { locale, t } = useLanguage();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('ALL');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [framesOpen, setFramesOpen] = useState(false);
  const [dimensionsOpen, setDimensionsOpen] = useState(false);
  const [draftDimensions, setDraftDimensions] = useState<DimensionInputs>(defaultDimensions);
  const [appliedDimensions, setAppliedDimensions] = useState<DimensionInputs>(defaultDimensions);
  const [dimensionError, setDimensionError] = useState('');
  const deferredSearch = useDeferredValue(search);

  const filterParams = useMemo<ArtworkFilterParams>(() => {
    const parseNumber = (value: string) => (value === '' ? undefined : Number(value));

    return {
      width: parseNumber(appliedDimensions.exactWidth),
      height: parseNumber(appliedDimensions.exactHeight),
      minWidth: parseNumber(appliedDimensions.minWidth),
      maxWidth: parseNumber(appliedDimensions.maxWidth),
      minHeight: parseNumber(appliedDimensions.minHeight),
      maxHeight: parseNumber(appliedDimensions.maxHeight),
      square: appliedDimensions.orientation === 'square' ? true : undefined,
      orientation:
        appliedDimensions.orientation === 'portrait' || appliedDimensions.orientation === 'landscape'
          ? appliedDimensions.orientation
          : undefined,
    };
  }, [appliedDimensions]);

  useEffect(() => {
    setLoading(true);
    setDimensionError('');

    const request = hasActiveDimensionFilters(filterParams)
      ? apiFilterArtworks(filterParams)
      : apiGetArtworks();

    request
      .then((response) => setArtworks(response.data))
      .catch(async (error) => {
        if (hasActiveDimensionFilters(filterParams)) {
          setDimensionError(error?.response?.data?.message || t('admin.somethingWentWrong'));
        }

        try {
          const fallbackResponse = await apiGetArtworks();
          setArtworks(fallbackResponse.data);
        } catch {
          setArtworks([]);
        }
      })
      .finally(() => setLoading(false));
  }, [filterParams, t]);

  const categoryOptions = useMemo(() => {
    const uniqueValues = Array.from(
      new Set(artworks.map((artwork) => artwork.categorySlug || artwork.category).filter(Boolean)),
    ).sort();

    return [
      { value: 'ALL', label: t('gallery.allCategories') },
      ...uniqueValues.map((value) => ({
        value: value as string,
        label: getArtworkCategory({ category: value as string } as Artwork, locale),
      })),
    ];
  }, [artworks, locale, t]);

  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase();

    return artworks.filter((artwork) => {
      const localizedTitle = getArtworkTitle(artwork, locale).toLowerCase();
      const localizedCategory = getArtworkCategory(artwork, locale).toLowerCase();
      const rawCategory = (artwork.category || '').toLowerCase();
      const matchesSearch =
        !q ||
        localizedTitle.includes(q) ||
        localizedCategory.includes(q) ||
        rawCategory.includes(q);

      const categoryValue = artwork.categorySlug || artwork.category || '';
      const matchesCategory = activeCategory === 'ALL' || categoryValue === activeCategory;
      const matchesStatus = statusFilter === 'ALL' || artwork.status === statusFilter;
      const matchesFeatured = !featuredOnly || artwork.featured;

      return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
    });
  }, [artworks, deferredSearch, activeCategory, statusFilter, featuredOnly, locale]);

  const grouped = useMemo(() => {
    if (activeCategory !== 'ALL') return { [activeCategory]: filtered };

    return filtered.reduce<Record<string, Artwork[]>>((acc, artwork) => {
      const category = artwork.categorySlug || artwork.category || 'uncategorised';
      if (!acc[category]) acc[category] = [];
      acc[category].push(artwork);
      return acc;
    }, {});
  }, [filtered, activeCategory]);

  const handleDimensionValue = (key: keyof DimensionInputs, value: string) => {
    setDraftDimensions((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    const next = { ...draftDimensions };
    if (hasDimensionValues({
      width: next.exactWidth === '' ? undefined : Number(next.exactWidth),
      height: next.exactHeight === '' ? undefined : Number(next.exactHeight),
      minWidth: next.minWidth === '' ? undefined : Number(next.minWidth),
      maxWidth: next.maxWidth === '' ? undefined : Number(next.maxWidth),
      minHeight: next.minHeight === '' ? undefined : Number(next.minHeight),
      maxHeight: next.maxHeight === '' ? undefined : Number(next.maxHeight),
    })) {
      setAppliedDimensions(next);
    } else {
      setAppliedDimensions({ ...next, orientation: next.orientation });
    }
  };

  const resetDimensionFilters = () => {
    setDraftDimensions(defaultDimensions);
    setAppliedDimensions(defaultDimensions);
    setDimensionError('');
  };

  return (
    <main className="page-shell max-w-7xl mx-auto px-6 py-12">
      <div className="glass-panel relative overflow-hidden p-6 md:p-8 mb-10">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="min-w-0">
            <p className="text-[0.625rem] tracking-[0.3em] uppercase text-[#f2d786] mb-2">{t('home.collection')}</p>
            <h1 className="section-title mb-3 text-wrap-safe">{t('gallery.title')}</h1>
            <p className="text-wrap-safe text-slate-300 text-sm max-w-2xl">{t('gallery.intro')}</p>
          </div>

          <div className="hidden md:flex md:justify-end">
            <div className="rounded-[var(--radius-xl)] border border-white/10 bg-black/10 p-3 backdrop-blur-sm">
              <img
                src="/logo.png"
                alt=""
                aria-hidden="true"
                className="h-14 w-14 lg:h-16 lg:w-16 object-contain opacity-80 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={t('gallery.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input-field md:max-w-xs"
          />

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-4 relative z-30">
            <div className="filter-panel">
              <label className="filter-label">{t('common.categories')}</label>
              <CustomDropdown
                options={categoryOptions}
                value={activeCategory}
                onChange={setActiveCategory}
                placeholder={t('common.all')}
              />
            </div>

            <div className="filter-panel">
              <label className="filter-label">{t('gallery.statusAndFrames')}</label>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setStatusFilter('ALL')} aria-pressed={statusFilter === 'ALL'} className={`filter-chip ${statusFilter === 'ALL' ? 'filter-chip-active' : ''}`}>{t('common.all')}</button>
                <button type="button" onClick={() => setStatusFilter('AVAILABLE')} aria-pressed={statusFilter === 'AVAILABLE'} className={`filter-chip ${statusFilter === 'AVAILABLE' ? 'filter-chip-active' : ''}`}>{t('common.available')}</button>
                <button type="button" onClick={() => setStatusFilter('SOLD')} aria-pressed={statusFilter === 'SOLD'} className={`filter-chip ${statusFilter === 'SOLD' ? 'filter-chip-active' : ''}`}>{t('common.sold')}</button>
                <button type="button" onClick={() => setFeaturedOnly((current) => !current)} aria-pressed={featuredOnly} className={`filter-chip ${featuredOnly ? 'filter-chip-gold-active' : ''}`}>{t('gallery.featuredOnly')}</button>
                <button type="button" onClick={() => setFramesOpen(true)} aria-pressed={framesOpen} className={`filter-chip ${framesOpen ? 'filter-chip-active' : ''}`}>{t('gallery.frames')}</button>
              </div>
            </div>
          </div>

          <div className="filter-panel dimension-filter-panel">
            <button
              type="button"
              onClick={() => setDimensionsOpen((current) => !current)}
              className="dimension-accordion-trigger"
              aria-expanded={dimensionsOpen}
            >
              <span className="filter-label mb-0">{t('gallery.dimensionsTitle')}</span>
              <span className={`dimension-accordion-icon ${dimensionsOpen ? 'dimension-accordion-icon-open' : ''}`}>+</span>
            </button>

            {dimensionsOpen && (
              <div className="pt-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                  <p className="text-sm text-slate-300">{t('gallery.dimensionsHelp')}</p>
                  {dimensionError ? <span className="text-sm text-red-300">{dimensionError}</span> : null}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.85fr)] gap-6">
                  <div className="space-y-4">
                    <div className="dimension-row">
                      <p className="dimension-heading">{t('gallery.exact')}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <input type="number" min="0" step="0.01" className="input-field input-no-spinner pr-14" placeholder={t('common.width')} value={draftDimensions.exactWidth} onChange={(event) => handleDimensionValue('exactWidth', event.target.value)} />
                          <span className="dimension-unit">{t('gallery.cmPlaceholder')}</span>
                        </div>
                        <div className="relative">
                          <input type="number" min="0" step="0.01" className="input-field input-no-spinner pr-14" placeholder={t('common.height')} value={draftDimensions.exactHeight} onChange={(event) => handleDimensionValue('exactHeight', event.target.value)} />
                          <span className="dimension-unit">{t('gallery.cmPlaceholder')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="dimension-row">
                      <p className="dimension-heading">{t('gallery.widthRange')}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <input type="number" min="0" step="0.01" className="input-field input-no-spinner pr-14" placeholder={t('gallery.min')} value={draftDimensions.minWidth} onChange={(event) => handleDimensionValue('minWidth', event.target.value)} />
                          <span className="dimension-unit">{t('gallery.cmPlaceholder')}</span>
                        </div>
                        <div className="relative">
                          <input type="number" min="0" step="0.01" className="input-field input-no-spinner pr-14" placeholder={t('gallery.max')} value={draftDimensions.maxWidth} onChange={(event) => handleDimensionValue('maxWidth', event.target.value)} />
                          <span className="dimension-unit">{t('gallery.cmPlaceholder')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="dimension-row">
                      <p className="dimension-heading">{t('gallery.heightRange')}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <input type="number" min="0" step="0.01" className="input-field input-no-spinner pr-14" placeholder={t('gallery.min')} value={draftDimensions.minHeight} onChange={(event) => handleDimensionValue('minHeight', event.target.value)} />
                          <span className="dimension-unit">{t('gallery.cmPlaceholder')}</span>
                        </div>
                        <div className="relative">
                          <input type="number" min="0" step="0.01" className="input-field input-no-spinner pr-14" placeholder={t('gallery.max')} value={draftDimensions.maxHeight} onChange={(event) => handleDimensionValue('maxHeight', event.target.value)} />
                          <span className="dimension-unit">{t('gallery.cmPlaceholder')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-5">
                    <div>
                      <label className="filter-label">{t('gallery.orientation')}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {orientationKeys.map((orientation) => (
                          <button
                            key={orientation}
                            type="button"
                            onClick={() => handleDimensionValue('orientation', orientation)}
                            className={`orientation-pill ${draftDimensions.orientation === orientation ? 'orientation-pill-active' : ''}`}
                          >
                            {t(`gallery.orientation${orientation.charAt(0).toUpperCase()}${orientation.slice(1)}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={resetDimensionFilters} className="btn-glass">
                        {t('gallery.resetFilters')}
                      </button>
                      <button type="button" onClick={applyFilters} className="btn-glass-gold">
                        {t('gallery.applyFilters')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={12} />
      ) : filtered.length === 0 ? (
        <div className="glass-panel py-24 text-center text-slate-300">
          <p className="font-serif text-2xl italic mb-2 text-white">{t('gallery.noArtworks')}</p>
          <p className="text-sm">{t('gallery.adjustFilters')}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, works]) => (
          <section key={category} className="mb-14">
            {activeCategory === 'ALL' && (
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-serif text-2xl text-white">
                  {getArtworkCategory({ category } as Artwork, locale)}
                </h2>
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-300">
                  {works.length} {getWorksLabel(works.length, locale)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {works.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} onClick={() => setSelected(artwork)} />
              ))}
            </div>
          </section>
        ))
      )}

      {selected ? <ArtworkModal artwork={selected} onClose={() => setSelected(null)} /> : null}
      <FramePreviewModal isOpen={framesOpen} onClose={() => setFramesOpen(false)} />
    </main>
  );
}
