begin;

alter table public.artworks
  drop column if exists artist;

commit;
