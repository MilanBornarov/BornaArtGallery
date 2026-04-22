ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS title_mk TEXT,
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS description_mk TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

UPDATE artworks
SET
  title_mk = COALESCE(title_mk, title),
  title_en = COALESCE(title_en, title),
  description_mk = COALESCE(description_mk, description),
  description_en = COALESCE(description_en, description);

ALTER TABLE artworks
  DROP CONSTRAINT IF EXISTS artworks_category_check;

ALTER TABLE artworks
  ADD CONSTRAINT artworks_category_check
  CHECK (category IN ('Landscapes', 'Abstract', 'Floral', 'Animals', 'Figurative', 'Boats', 'Frames'));
