const PLACEHOLDER_PATTERN = /^<[^>]+>$|^\[[A-Z0-9_]+\]$/i;

function isConfiguredValue(value?: string | null) {
  if (!value) {
    return false;
  }

  const normalized = value.trim();
  return normalized.length > 0 && !PLACEHOLDER_PATTERN.test(normalized);
}

export function pickConfiguredValue(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (isConfiguredValue(value)) {
      return value!.trim();
    }
  }

  return null;
}

export function normalizeExternalUrl(value?: string | null) {
  const configured = pickConfiguredValue(value);
  if (!configured) {
    return null;
  }

  const candidate = /^[a-z][a-z\d+\-.]*:/i.test(configured) ? configured : `https://${configured}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeEmailUrl(value?: string | null) {
  const configured = pickConfiguredValue(value);
  if (!configured) {
    return null;
  }

  const address = configured.replace(/^mailto:/i, '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    return null;
  }

  return `mailto:${address}`;
}

export function normalizePhoneUrl(value?: string | null, fallback?: string | null) {
  const configured = pickConfiguredValue(value, fallback);
  if (!configured) {
    return null;
  }

  const normalized = configured.replace(/^tel:/i, '').trim();
  const digits = normalized.replace(/[^\d+]/g, '');
  if (digits.length < 6) {
    return null;
  }

  return `tel:${digits}`;
}
