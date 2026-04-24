import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  apiDeleteArtwork,
  apiGetArtworks,
  apiReplaceArtworkImage,
  apiToggleFeatured,
  apiUpdateArtwork,
  apiUpdateArtworkStatus,
  apiUploadArtwork,
} from '../services/api';
import type { Artwork, ArtworkFormData } from '../types';
import ArtworkForm from '../components/ArtworkForm';
import FramePreviewModal from '../components/FramePreviewModal';
import { GridSkeleton } from '../components/LoadingSkeleton';
import CustomDropdown, { type DropdownOption } from '../components/CustomDropdown';
import { useLanguage } from '../context/LanguageContext';
import {
  getArtworkCategory,
  getArtworkTitle,
  getStatusLabel,
  getWorksLabel,
} from '../i18n/helpers';

type View = 'list' | 'create' | 'edit';

export default function AdminDashboard() {
  const { locale, t } = useLanguage();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<Artwork | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [framesOpen, setFramesOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const statusFilterOptions: DropdownOption[] = useMemo(() => [
    { value: 'ALL', label: t('gallery.allStatuses') },
    { value: 'AVAILABLE', label: t('common.available') },
    { value: 'SOLD', label: t('common.sold') },
  ], [t]);

  const cardStatusOptions: DropdownOption[] = useMemo(() => [
    { value: 'AVAILABLE', label: getStatusLabel('AVAILABLE', locale) },
    { value: 'SOLD', label: getStatusLabel('SOLD', locale) },
  ], [locale]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const load = () => {
    setLoading(true);
    apiGetArtworks().then((r) => setArtworks(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (data: ArtworkFormData, file?: File) => {
    if (!file) return;
    await apiUploadArtwork(file, data);
    showToast(t('admin.artworkUploaded'));
    setView('list');
    load();
  };

  const handleEdit = async (data: ArtworkFormData, file?: File) => {
    if (!editing) return;
    await apiUpdateArtwork(editing.id, data);
    if (file) await apiReplaceArtworkImage(editing.id, file);
    showToast(t('admin.artworkUpdated'));
    setView('list');
    setEditing(null);
    load();
  };

  const categoryOptions = useMemo<DropdownOption[]>(() => {
    const values = Array.from(
      new Set(artworks.map((a) => a.categorySlug || a.category).filter(Boolean)),
    ).sort();
    return [
      { value: 'ALL', label: t('gallery.allCategories') },
      ...values.map((value) => ({
        value: value as string,
        label: getArtworkCategory({ category: value as string } as Artwork, locale),
      })),
    ];
  }, [artworks, locale, t]);

  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase();

    return artworks.filter((art) => {
      const title = getArtworkTitle(art, locale).toLowerCase();
      const category = getArtworkCategory(art, locale).toLowerCase();
      const rawCategory = (art.category || '').toLowerCase();
      const matchesSearch =
        !q || title.includes(q) || category.includes(q) || rawCategory.includes(q);
      const matchesStatus = statusFilter === 'ALL' || art.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'ALL' || (art.categorySlug || art.category) === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [artworks, categoryFilter, deferredSearch, locale, statusFilter]);

  if (view === 'create') {
    return (
      <main className="page-shell max-w-2xl mx-auto py-12">
        <button onClick={() => setView('list')} className="glass-inline-link mb-6 flex items-center gap-2">
          <span aria-hidden="true">&larr;</span>
          <span>{t('admin.backToDashboard')}</span>
        </button>
        <div className="glass-panel p-8">
          <h1 className="section-title mb-8">{t('admin.uploadNewArtwork')}</h1>
          <ArtworkForm onSubmit={handleCreate} onCancel={() => setView('list')} />
        </div>
      </main>
    );
  }

  if (view === 'edit' && editing) {
    return (
      <main className="page-shell max-w-2xl mx-auto py-12">
        <button
          onClick={() => {
            setView('list');
            setEditing(null);
          }}
          className="glass-inline-link mb-6 flex items-center gap-2"
        >
          <span aria-hidden="true">&larr;</span>
          <span>{t('admin.backToDashboard')}</span>
        </button>
        <div className="glass-panel p-8">
          <h1 className="section-title mb-8">{t('admin.editArtwork')}</h1>
          <ArtworkForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => {
              setView('list');
              setEditing(null);
            }}
            isEdit
          />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell max-w-7xl mx-auto py-12">
      {toast && (
        <div className="fixed top-20 right-6 z-[9990] glass-toast animate-slideUp">
          {toast}
        </div>
      )}

      <div className="glass-panel p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[0.625rem] tracking-[0.3em] uppercase text-gallery-gold mb-1">{t('admin.admin')}</p>
            <h1 className="section-title">{t('admin.dashboardTitle')}</h1>
            <p className="text-slate-300 text-sm mt-1">
              {t('admin.inCollection', {
                count: artworks.length,
                label: getWorksLabel(artworks.length, locale),
              })}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setView('create')} className="btn-glass self-start md:self-auto">
              + {t('admin.uploadArtwork')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] gap-4 mt-6 relative z-30">
          <input
            type="text"
            placeholder={t('admin.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />

          <CustomDropdown
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as 'ALL' | 'AVAILABLE' | 'SOLD')}
          />

          <CustomDropdown
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="glass-panel py-16 text-center text-gallery-stone">
          <p className="font-serif text-xl italic">{t('admin.noArtworks')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((art) => {
            const localizedCategory = getArtworkCategory(art, locale);

            return (
              <div key={art.id} className="glass-card group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(var(--radius-xl)-0.35rem)] bg-gallery-warm">
                  <img
                    src={art.imageUrl}
                    alt={getArtworkTitle(art, locale)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {art.featured && (
                    <span className="absolute top-2 left-2 bg-gallery-gold text-gallery-dark text-[0.5625rem] tracking-widest uppercase px-2 py-1 rounded-[var(--radius-pill)]">
                      {'\u2605'} {t('admin.featured')}
                    </span>
                  )}

                  <span
                    className={`absolute bottom-2 left-2 status-badge-glass text-[0.5625rem] tracking-widest uppercase px-2 py-1 ${
                      art.status === 'SOLD' ? 'status-badge-sold' : 'status-badge-available'
                    }`}
                  >
                    {getStatusLabel(art.status, locale)}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-serif text-base text-slate-50 truncate">{getArtworkTitle(art, locale)}</h3>
                  <p className="text-slate-300 text-xs mt-0.5 mb-4">
                    {t('common.brand')}
                    {art.year ? ` \u00b7 ${art.year}` : ''}
                    {localizedCategory ? ` \u00b7 ${localizedCategory}` : ''}
                  </p>

                  <div className="flex gap-2 flex-wrap mb-3">
                    <button
                      onClick={() => {
                        setEditing(art);
                        setView('edit');
                      }}
                      className="btn-glass-sm"
                    >
                      {t('admin.edit')}
                    </button>

                    <button
                      onClick={async () => {
                        await apiToggleFeatured(art.id);
                        showToast(t('admin.featuredUpdated'));
                        load();
                      }}
                      className={`featured-admin-btn ${art.featured ? 'featured-admin-btn-active' : ''}`}
                    >
                      {art.featured ? `\u2605 ${t('admin.featured')}` : `\u2606 ${t('admin.feature')}`}
                    </button>

                    <button onClick={() => setDeleteId(art.id)} className="btn-glass-danger-sm">
                      {t('admin.delete')}
                    </button>
                  </div>

                  <CustomDropdown
                    options={cardStatusOptions}
                    value={art.status}
                    onChange={async (val) => {
                      await apiUpdateArtworkStatus(art.id, val as 'AVAILABLE' | 'SOLD');
                      showToast(t('admin.statusUpdated'));
                      load();
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-[9998] bg-black/65 flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-8">
            <h3 className="font-serif text-xl mb-3">{t('admin.deleteQuestion')}</h3>
            <p className="text-slate-300 text-sm mb-6">
              {t('admin.deleteBody')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await apiDeleteArtwork(deleteId);
                  setDeleteId(null);
                  showToast(t('admin.artworkDeleted'));
                  load();
                }}
                className="btn-glass-danger flex-1"
              >
                {t('admin.yesDelete')}
              </button>
              <button onClick={() => setDeleteId(null)} className="btn-glass flex-1">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <FramePreviewModal isOpen={framesOpen} onClose={() => setFramesOpen(false)} />
    </main>
  );
}
