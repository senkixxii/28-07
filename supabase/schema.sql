-- =====================================================================
-- Our Little Love Book — Database schema
-- =====================================================================
-- Run this whole file once in the Supabase SQL Editor (or via the
-- Supabase CLI / MCP `apply_migration`) on a fresh project.
--
-- Data model: every row is owned by exactly one authenticated user
-- (auth.uid() = user_id). A "couple" in this app is one account that
-- stores both partners' names/photos in `couple_settings` — there is
-- no cross-account sharing, which keeps the security model simple:
-- a user can only ever see their own rows.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = user_id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (user_id) do nothing;

  insert into public.couple_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- couple_settings
-- ---------------------------------------------------------------------
create table if not exists public.couple_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  my_name text not null default 'ฉัน',
  partner_name text not null default 'เธอ',
  relationship_start_date date,
  couple_photo_url text,
  my_avatar_url text,
  partner_avatar_url text,
  theme_preference text not null default 'pastel',
  reminder_days_before int not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger couple_settings_set_updated_at
  before update on public.couple_settings
  for each row execute function public.set_updated_at();

alter table public.couple_settings enable row level security;

create policy "couple_settings_select_own" on public.couple_settings
  for select using (auth.uid() = user_id);
create policy "couple_settings_insert_own" on public.couple_settings
  for insert with check (auth.uid() = user_id);
create policy "couple_settings_update_own" on public.couple_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "couple_settings_delete_own" on public.couple_settings
  for delete using (auth.uid() = user_id);

-- Now that couple_settings exists, wire up the signup trigger.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- This function must only ever run via the trigger above, never as a
-- directly-callable RPC (it is SECURITY DEFINER).
revoke execute on function public.handle_new_user() from anon, authenticated;

-- ---------------------------------------------------------------------
-- memories
-- ---------------------------------------------------------------------
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  personal_message text,
  location text,
  memory_date date not null default current_date,
  cover_image_url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_user_id_date_idx
  on public.memories (user_id, memory_date desc);

create trigger memories_set_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

alter table public.memories enable row level security;

create policy "memories_select_own" on public.memories
  for select using (auth.uid() = user_id);
create policy "memories_insert_own" on public.memories
  for insert with check (auth.uid() = user_id);
create policy "memories_update_own" on public.memories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memories_delete_own" on public.memories
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- memory_images
-- ---------------------------------------------------------------------
create table if not exists public.memory_images (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists memory_images_memory_id_idx
  on public.memory_images (memory_id, sort_order);

alter table public.memory_images enable row level security;

create policy "memory_images_select_own" on public.memory_images
  for select using (auth.uid() = user_id);
create policy "memory_images_insert_own" on public.memory_images
  for insert with check (auth.uid() = user_id);
create policy "memory_images_update_own" on public.memory_images
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memory_images_delete_own" on public.memory_images
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- anniversaries
-- ---------------------------------------------------------------------
create table if not exists public.anniversaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  anniversary_date date not null,
  month_number int,
  year_number int,
  description text,
  message text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists anniversaries_user_id_date_idx
  on public.anniversaries (user_id, anniversary_date);

create trigger anniversaries_set_updated_at
  before update on public.anniversaries
  for each row execute function public.set_updated_at();

alter table public.anniversaries enable row level security;

create policy "anniversaries_select_own" on public.anniversaries
  for select using (auth.uid() = user_id);
create policy "anniversaries_insert_own" on public.anniversaries
  for insert with check (auth.uid() = user_id);
create policy "anniversaries_update_own" on public.anniversaries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "anniversaries_delete_own" on public.anniversaries
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- letters
-- ---------------------------------------------------------------------
create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null,
  letter_date date not null default current_date,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists letters_user_id_date_idx
  on public.letters (user_id, letter_date desc);

create trigger letters_set_updated_at
  before update on public.letters
  for each row execute function public.set_updated_at();

alter table public.letters enable row level security;

create policy "letters_select_own" on public.letters
  for select using (auth.uid() = user_id);
create policy "letters_insert_own" on public.letters
  for insert with check (auth.uid() = user_id);
create policy "letters_update_own" on public.letters
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "letters_delete_own" on public.letters
  for delete using (auth.uid() = user_id);

-- =====================================================================
-- Storage: memory-images bucket
-- =====================================================================
-- Path convention: {user_id}/{memory_id}/{filename}
-- Enforced by policies below (first path segment must equal auth.uid()).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-images',
  'memory-images',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "memory_images_storage_read_own"
  on storage.objects for select
  using (
    bucket_id = 'memory-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "memory_images_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'memory-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "memory_images_storage_update_own"
  on storage.objects for update
  using (
    bucket_id = 'memory-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'memory-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "memory_images_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'memory-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Bucket is public for read (simplifies serving images via CDN URL);
-- the policies above still gate writes/deletes to the owning user.
-- If you'd rather keep images fully private, set `public = false` above
-- and switch the app to use signed URLs instead of public URLs.
