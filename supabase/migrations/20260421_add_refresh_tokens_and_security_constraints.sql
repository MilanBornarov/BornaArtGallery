begin;

alter table public.users
  alter column email type varchar(255),
  alter column password type varchar(255),
  alter column role type varchar(50);

create unique index if not exists idx_users_email_lower on public.users ((lower(email)));

alter table public.artworks
  add column if not exists cloudinary_public_id varchar(255),
  add column if not exists status varchar(20) not null default 'AVAILABLE';

alter table public.artworks
  drop constraint if exists artworks_status_check;

alter table public.artworks
  add constraint artworks_status_check
  check (status in ('AVAILABLE', 'SOLD'));

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

commit;
