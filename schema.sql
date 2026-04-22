-- ============================================================
-- Art Gallery - Current Production-Oriented Schema
-- Run these statements in Supabase SQL Editor before using
-- SPRING_JPA_HIBERNATE_DDL_AUTO=validate in production.
-- ============================================================

create table if not exists public.users (
  id bigserial primary key,
  email varchar(255) not null unique,
  password varchar(255) not null,
  role varchar(50) not null default 'USER',
  created_at timestamp default now()
);

create unique index if not exists idx_users_email_lower on public.users ((lower(email)));

create table if not exists public.artworks (
  id bigserial primary key,
  title varchar(255),
  title_mk text,
  title_en text,
  description text,
  description_mk text,
  description_en text,
  category varchar(100),
  image_url varchar(1000),
  cloudinary_public_id varchar(255),
  is_featured boolean default false,
  year integer,
  width numeric(10, 2),
  height numeric(10, 2),
  status varchar(20) not null default 'AVAILABLE',
  facebook_link varchar(1000),
  created_at timestamp default now(),
  constraint artworks_status_check check (status in ('AVAILABLE', 'SOLD'))
);

create index if not exists idx_artworks_featured on public.artworks(is_featured);
create index if not exists idx_artworks_category on public.artworks(category);

create table if not exists public.favorites (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  artwork_id bigint not null references public.artworks(id) on delete cascade,
  created_at timestamp default now(),
  unique(user_id, artwork_id)
);

create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_favorites_artwork on public.favorites(artwork_id);

create table if not exists public.refresh_tokens (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  token_hash varchar(64) not null unique,
  family_id varchar(36) not null,
  expires_at timestamp not null,
  last_used_at timestamp null,
  revoked_at timestamp null,
  replaced_by_token_hash varchar(64) null,
  created_at timestamp not null default now()
);

create index if not exists idx_refresh_tokens_user_id on public.refresh_tokens(user_id);
create index if not exists idx_refresh_tokens_family_id on public.refresh_tokens(family_id);
