alter table public.users enable row level security;
alter table public.artworks enable row level security;
alter table public.favorites enable row level security;
alter table public.refresh_tokens enable row level security;

drop policy if exists "artworks public read" on public.artworks;
create policy "artworks public read"
on public.artworks
for select
to anon, authenticated
using (true);

drop policy if exists "favorites own rows" on public.favorites;
create policy "favorites own rows"
on public.favorites
for all
to authenticated
using (auth.jwt() ->> 'email' = (
  select u.email from public.users u where u.id = favorites.user_id
))
with check (auth.jwt() ->> 'email' = (
  select u.email from public.users u where u.id = favorites.user_id
));

drop policy if exists "users self read" on public.users;
create policy "users self read"
on public.users
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "users block writes" on public.users;
create policy "users block writes"
on public.users
for all
to authenticated
using (false)
with check (false);

drop policy if exists "refresh tokens blocked" on public.refresh_tokens;
create policy "refresh tokens blocked"
on public.refresh_tokens
for all
to anon, authenticated
using (false)
with check (false);
