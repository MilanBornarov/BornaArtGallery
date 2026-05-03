import { useMemo, useRef, useState } from 'react';
import type { Artwork, ArtworkFormData } from '../types';
import CustomDropdown, { type DropdownOption } from './CustomDropdown';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryLabel } from '../i18n/helpers';
import { getCloudinaryImageProps } from '../utils/cloudinary';

interface Props {
  initial?: Artwork;
  onSubmit: (data: ArtworkFormData, file?: File) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const empty: ArtworkFormData = {
  title: '',
  titleMk: '',
  titleEn: '',
  description: '',
  descriptionMk: '',
  descriptionEn: '',
  category: '',
  year: '',
  width: '',
  height: '',
  featured: false,
  status: 'AVAILABLE',
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response;
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
        return data.message;
      }
    }
  }

  return fallback;
}

export default function ArtworkForm({ initial, onSubmit, onCancel, isEdit = false }: Props) {
  const { t } = useLanguage();
  const initialPreview = getCloudinaryImageProps({
    publicId: initial?.cloudinaryPublicId,
    fallbackUrl: initial?.imageUrl,
    widths: [300, 400],
    width: 400,
    height: 300,
    crop: 'fill',
  });
  const [form, setForm] = useState<ArtworkFormData>(
    initial
      ? {
          title: initial.titleMk || initial.title || '',
          titleMk: initial.titleMk || initial.title || '',
          titleEn: initial.titleEn || '',
          description: initial.descriptionMk || initial.description || '',
          descriptionMk: initial.descriptionMk || initial.description || '',
          descriptionEn: initial.descriptionEn || '',
          category: initial.categorySlug || initial.category || '',
          year: initial.year ? String(initial.year) : '',
          width: initial.width != null ? String(initial.width) : '',
          height: initial.height != null ? String(initial.height) : '',
          featured: initial.featured,
          status: initial.status,
        }
      : empty,
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialPreview.src);
  const [previewSrcSet, setPreviewSrcSet] = useState<string | undefined>(initialPreview.srcSet);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const widthInvalid = form.width !== '' && Number(form.width) < 0;
  const heightInvalid = form.height !== '' && Number(form.height) < 0;

  const categoryOptions = useMemo<DropdownOption[]>(() => [
    { value: '', label: t('admin.selectCategory') },
    { value: 'Landscapes', label: `${getCategoryLabel('Landscapes', 'en')} / ${getCategoryLabel('Landscapes', 'mk')}` },
    { value: 'Abstract', label: `${getCategoryLabel('Abstract', 'en')} / ${getCategoryLabel('Abstract', 'mk')}` },
    { value: 'Floral', label: `${getCategoryLabel('Floral', 'en')} / ${getCategoryLabel('Floral', 'mk')}` },
    { value: 'Animals', label: `${getCategoryLabel('Animals', 'en')} / ${getCategoryLabel('Animals', 'mk')}` },
    { value: 'Figurative', label: `${getCategoryLabel('Figurative', 'en')} / ${getCategoryLabel('Figurative', 'mk')}` },
    { value: 'Boats', label: `${getCategoryLabel('Boats', 'en')} / ${getCategoryLabel('Boats', 'mk')}` },
    { value: 'Frames', label: `${getCategoryLabel('Frames', 'en')} / ${getCategoryLabel('Frames', 'mk')}` },
  ], [t]);

  const statusOptions = useMemo<DropdownOption[]>(() => [
    { value: 'AVAILABLE', label: `${t('common.available')} / AVAILABLE` },
    { value: 'SOLD', label: `${t('common.sold')} / SOLD` },
  ], [t]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setPreviewSrcSet(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.titleMk.trim() && !(form.titleEn ?? '').trim()) {
      setError(t('admin.titleRequired'));
      return;
    }
    if (!isEdit && !file) {
      setError(t('admin.pleaseSelectImage'));
      return;
    }
    if (!form.width || !form.height) {
      setError(t('admin.dimensionsRequired'));
      return;
    }
    if (widthInvalid || heightInvalid) {
      setError(t('admin.dimensionsNonNegative'));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form, file || undefined);
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('admin.somethingWentWrong')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="auth-error">{error}</div>
      )}

      <div>
        <label className="block text-xs tracking-wider uppercase text-gallery-stone mb-2">
          {isEdit ? t('admin.replaceImageOptional') : t('admin.imageRequired')}
        </label>
        <div
          className="border-2 border-dashed border-gallery-warm hover:border-gallery-gold transition-colors cursor-pointer rounded-[var(--radius-xl)] overflow-hidden"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              srcSet={previewSrcSet}
              sizes="(min-width: 768px) 40rem, 100vw"
              alt={t('common.image')}
              className="w-full h-48 object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gallery-stone gap-2">
              <span className="text-3xl">+</span>
              <span className="text-sm">{t('admin.clickToSelect')}</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-gallery-stone mb-1.5">{t('common.title')} *</label>
        <input
          className="input-field"
          value={form.titleMk}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value, titleMk: e.target.value }))}
          placeholder={t('admin.artworkTitlePlaceholderMk')}
        />
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-gallery-stone mb-1.5">{t('admin.titleEn')}</label>
        <input
          className="input-field"
          value={form.titleEn || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, titleEn: e.target.value }))}
          placeholder={t('admin.artworkTitlePlaceholderEn')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs tracking-wider uppercase text-gallery-stone mb-1.5">{t('common.category')}</label>
          <CustomDropdown
            options={categoryOptions}
            value={form.category}
            onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
          />
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-gallery-stone mb-1.5">{t('common.year')}</label>
          <input
            className="input-field"
            type="number"
            value={form.year}
            onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
            placeholder="2026"
            min="1"
            max="3000"
          />
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-gallery-stone mb-1.5">{t('common.status')}</label>
          <CustomDropdown
            options={statusOptions}
            value={form.status}
            onChange={(val) => setForm((prev) => ({ ...prev, status: val as 'AVAILABLE' | 'SOLD' }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-wider uppercase text-gallery-stone mb-1.5">
            {t('common.width')} *
          </label>
          <div className="relative">
            <input
              className={`input-field pr-14 ${widthInvalid ? 'input-field-error' : ''}`}
              type="number"
              min="0"
              step="0.01"
              value={form.width}
              onChange={(e) => setForm((prev) => ({ ...prev, width: e.target.value }))}
              placeholder="50"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.22em] text-slate-400">
              cm
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-gallery-stone mb-1.5">
            {t('common.height')} *
          </label>
          <div className="relative">
            <input
              className={`input-field pr-14 ${heightInvalid ? 'input-field-error' : ''}`}
              type="number"
              min="0"
              step="0.01"
              value={form.height}
              onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
              placeholder="50"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.22em] text-slate-400">
              cm
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-gallery-stone mb-1.5">{t('common.description')}</label>
        <textarea
          className="input-field resize-none text-pre-wrap"
          rows={4}
          value={form.descriptionMk}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value, descriptionMk: e.target.value }))}
          placeholder={t('admin.descriptionPlaceholderMk')}
        />
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-gallery-stone mb-1.5">{t('admin.descriptionEn')}</label>
        <textarea
          className="input-field resize-none text-pre-wrap"
          rows={4}
          value={form.descriptionEn || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, descriptionEn: e.target.value }))}
          placeholder={t('admin.descriptionPlaceholderEn')}
        />
      </div>

      <div className="featured-toggle-wrap flex items-center justify-between gap-4">
        <div>
          <p className="featured-toggle-label">{t('admin.markAsFeatured')}</p>
          <p className="featured-toggle-help">{t('admin.featuredHelp')}</p>
        </div>
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, featured: !prev.featured }))}
          className={`featured-toggle ${form.featured ? 'featured-toggle-on' : 'featured-toggle-off'}`}
          aria-pressed={form.featured}
          aria-label={t('admin.toggleFeatured')}
        >
          <span className="featured-toggle-knob" />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting} className="btn-glass-gold flex-1">
          {submitting ? t('admin.saving') : isEdit ? t('admin.saveChanges') : t('admin.uploadArtwork')}
        </button>
        <button type="button" onClick={onCancel} className="btn-glass flex-1">
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
