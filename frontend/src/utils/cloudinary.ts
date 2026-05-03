type CloudinaryScalar = string | number;

export interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: CloudinaryScalar;
  format?: string;
  dpr?: CloudinaryScalar;
}

interface ResponsiveCloudinaryOptions extends CloudinaryImageOptions {
  publicId?: string | null;
  fallbackUrl?: string | null;
  widths?: number[];
}

export interface ResponsiveCloudinaryImageProps {
  src: string;
  srcSet?: string;
}

const CLOUDINARY_HOST = 'res.cloudinary.com';

const DEFAULT_TRANSFORMATIONS = {
  format: 'auto',
  quality: 'auto',
  crop: 'limit',
  dpr: 'auto',
} satisfies Required<Pick<CloudinaryImageOptions, 'format' | 'quality' | 'crop' | 'dpr'>>;

function isPositiveNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function transformationPart(prefix: string, value: CloudinaryScalar | undefined) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return `${prefix}_${value}`;
}

function normalizeImageUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\/\//.test(trimmed)) {
    return `https:${trimmed}`;
  }

  if (/^res\.cloudinary\.com\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  if (/^(https?:|blob:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/|$)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

function cloudNameFromValue(value?: string | null) {
  const normalized = normalizeImageUrl(value);
  if (!normalized) {
    return null;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.hostname.toLowerCase() === CLOUDINARY_HOST) {
      const [cloudName] = parsed.pathname.split('/').filter(Boolean);
      return cloudName || null;
    }
  } catch {
  }

  return /^[a-z0-9_-]+$/i.test(normalized) ? normalized : null;
}

const CONFIGURED_CLOUD_NAME = cloudNameFromValue(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

function cloudinaryPublicIdFromUrl(value?: string | null) {
  const normalized = normalizeImageUrl(value);
  if (!normalized) {
    return null;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.hostname.toLowerCase() !== CLOUDINARY_HOST) {
      return null;
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    const uploadIndex = segments.indexOf('upload');
    if (uploadIndex === -1) {
      return null;
    }

    const deliverySegments = segments.slice(uploadIndex + 1);
    while (deliverySegments[0] && /^(?:[a-z]+_|[a-z]+,)/i.test(deliverySegments[0])) {
      deliverySegments.shift();
    }
    if (deliverySegments[0] && /^v\d+$/i.test(deliverySegments[0])) {
      deliverySegments.shift();
    }

    if (deliverySegments.length === 0) {
      return null;
    }

    const lastIndex = deliverySegments.length - 1;
    deliverySegments[lastIndex] = deliverySegments[lastIndex].replace(/\.(?:avif|gif|jpe?g|png|webp)$/i, '');
    return deliverySegments.map(decodeURIComponent).join('/');
  } catch {
    return null;
  }
}

function normalizePublicId(publicId?: string | null) {
  const parsedPublicId = cloudinaryPublicIdFromUrl(publicId);
  if (parsedPublicId) {
    return parsedPublicId;
  }

  const trimmed = publicId?.trim().replace(/^\/+/, '');
  return trimmed || null;
}

function encodePublicId(publicId: string) {
  return publicId
    .trim()
    .replace(/^\/+/, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildTransformations(options: CloudinaryImageOptions = {}) {
  const format = options.format ?? DEFAULT_TRANSFORMATIONS.format;
  const quality = options.quality ?? DEFAULT_TRANSFORMATIONS.quality;
  const crop = options.crop ?? DEFAULT_TRANSFORMATIONS.crop;
  const dpr = options.dpr ?? DEFAULT_TRANSFORMATIONS.dpr;

  return [
    transformationPart('f', format),
    transformationPart('q', quality),
    transformationPart('c', crop),
    transformationPart('g', options.gravity),
    isPositiveNumber(options.width) ? transformationPart('w', Math.round(options.width)) : null,
    isPositiveNumber(options.height) ? transformationPart('h', Math.round(options.height)) : null,
    transformationPart('dpr', dpr),
  ]
    .filter((part): part is string => Boolean(part))
    .join(',');
}

function buildCloudinaryImageUrl(publicId?: string | null, options?: CloudinaryImageOptions, cloudName = CONFIGURED_CLOUD_NAME) {
  const normalizedPublicId = normalizePublicId(publicId);
  if (!cloudName || !normalizedPublicId) {
    return null;
  }

  return `https://${CLOUDINARY_HOST}/${encodeURIComponent(cloudName)}/image/upload/${buildTransformations(options)}/${encodePublicId(normalizedPublicId)}`;
}

export function getCloudinaryImageUrl(publicId?: string | null, options?: CloudinaryImageOptions) {
  return buildCloudinaryImageUrl(publicId, options);
}

export function getCloudinarySrcSet(
  publicId: string | null | undefined,
  widths: number[],
  options?: CloudinaryImageOptions,
  cloudName = CONFIGURED_CLOUD_NAME,
) {
  const entries = widths
    .filter(isPositiveNumber)
    .map((width) => {
      const height =
        isPositiveNumber(options?.width) && isPositiveNumber(options?.height)
          ? Math.round((width * options.height) / options.width)
          : options?.height;
      const url = buildCloudinaryImageUrl(publicId, { ...options, width, height }, cloudName);
      return url ? `${url} ${Math.round(width)}w` : null;
    })
    .filter((entry): entry is string => Boolean(entry));

  return entries.length > 0 ? entries.join(', ') : undefined;
}

export function getCloudinaryImageProps({
  publicId,
  fallbackUrl,
  widths,
  ...options
}: ResponsiveCloudinaryOptions): ResponsiveCloudinaryImageProps {
  const normalizedFallbackUrl = normalizeImageUrl(fallbackUrl);
  const cloudName = CONFIGURED_CLOUD_NAME ?? cloudNameFromValue(normalizedFallbackUrl);
  const resolvedPublicId = normalizePublicId(publicId) ?? cloudinaryPublicIdFromUrl(normalizedFallbackUrl);
  const src = buildCloudinaryImageUrl(resolvedPublicId, options, cloudName) ?? normalizedFallbackUrl ?? '';
  const srcSet = resolvedPublicId && widths ? getCloudinarySrcSet(resolvedPublicId, widths, options, cloudName) : undefined;

  return { src, srcSet };
}
