begin;

alter table public.artworks
  drop column if exists facebook_link;

commit;
