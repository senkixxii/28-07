-- =====================================================================
-- Our Little Love Book — Database schema
-- =====================================================================
-- Run this whole file once in the Supabase SQL Editor (or via the
-- Supabase CLI / MCP `apply_migration`) on a fresh project.
--
-- Data model: every couple's data (settings, anniversaries, letters,
-- gallery) is owned by a `couples` row, not by a single auth user. Each
-- auth user belongs to at most one couple via `couple_members` — so two
-- separate accounts (different emails) can share and edit the same
-- love book once one of them joins the other's couple with an invite
-- code. `user_id` columns on data tables stay as "created by" (audit)
-- only; access control runs entirely on couple membership.
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
-- profiles (one per auth user, independent of any couple)
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
  for select using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profiles_delete_own" on public.profiles
  for delete using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- couples + couple_members
-- ---------------------------------------------------------------------
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

alter table public.couples enable row level security;

create table if not exists public.couple_members (
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);

create index if not exists couple_members_couple_id_idx on public.couple_members (couple_id);

alter table public.couple_members enable row level security;

-- Every RLS policy below funnels through this: the couple_id the calling
-- user currently belongs to (each auth user belongs to at most one couple).
create or replace function public.my_couple_id()
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select couple_id from public.couple_members where user_id = auth.uid()
$$;

-- A user can always see their own membership row (this is what lets
-- my_couple_id() resolve without recursing), and can see their partner's
-- membership row once they share a couple_id.
create policy "couple_members_select_self" on public.couple_members
  for select using (user_id = (select auth.uid()));
create policy "couple_members_select_same_couple" on public.couple_members
  for select using (couple_id = (select public.my_couple_id()));

create policy "couples_select_member" on public.couples
  for select using (id = (select public.my_couple_id()));

-- No client-side insert/update/delete policies on couples/couple_members —
-- membership only ever changes via the SECURITY DEFINER functions below.

-- ---------------------------------------------------------------------
-- couple_settings (one shared row per couple)
-- ---------------------------------------------------------------------
create table if not exists public.couple_settings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null unique references public.couples (id) on delete cascade,
  my_name text not null default 'ฉัน',
  partner_name text not null default 'เธอ',
  relationship_start_date date,
  couple_photo_url text,
  my_avatar_url text,
  partner_avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger couple_settings_set_updated_at
  before update on public.couple_settings
  for each row execute function public.set_updated_at();

alter table public.couple_settings enable row level security;

create policy "couple_settings_select_member" on public.couple_settings
  for select using (couple_id = (select public.my_couple_id()));
create policy "couple_settings_insert_member" on public.couple_settings
  for insert with check (couple_id = (select public.my_couple_id()));
create policy "couple_settings_update_member" on public.couple_settings
  for update using (couple_id = (select public.my_couple_id())) with check (couple_id = (select public.my_couple_id()));
create policy "couple_settings_delete_member" on public.couple_settings
  for delete using (couple_id = (select public.my_couple_id()));

-- Auto-create a profile + couple (+ its couple_settings) whenever a new
-- auth user signs up. Two people end up sharing one couple only once one
-- of them calls join_couple() with the other's invite code (see below).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_couple_id uuid;
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (user_id) do nothing;

  insert into public.couples (invite_code)
  values (substr(md5(random()::text || clock_timestamp()::text), 1, 8))
  returning id into v_couple_id;

  insert into public.couple_members (couple_id, user_id, role)
  values (v_couple_id, new.id, 'owner');

  insert into public.couple_settings (couple_id)
  values (v_couple_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- This function must only ever run via the trigger above, never as a
-- directly-callable RPC (it is SECURITY DEFINER). Functions grant EXECUTE
-- to PUBLIC by default, and that grant isn't removed by revoking from
-- anon/authenticated alone — PUBLIC must be revoked explicitly too.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- join_couple / regenerate_invite_code: the only way membership changes
-- ---------------------------------------------------------------------
-- Moves the caller into the couple owning p_invite_code, provided the
-- caller isn't already sharing a couple and has no data of their own yet
-- (so joining can never silently orphan or delete real content), and the
-- target couple has fewer than 2 members. Their own (now-empty) solo
-- couple is deleted so nothing is left behind.
create or replace function public.join_couple(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_my_couple uuid;
  v_target_couple uuid;
  v_my_data_count int;
  v_target_member_count int;
begin
  if v_caller is null then
    raise exception 'not authenticated';
  end if;

  select id into v_target_couple from public.couples where invite_code = trim(p_invite_code);
  if v_target_couple is null then
    raise exception 'รหัสเชิญไม่ถูกต้องนะ ลองเช็คอีกทีนะ';
  end if;

  select couple_id into v_my_couple from public.couple_members where user_id = v_caller;

  if v_my_couple is not null and v_my_couple = v_target_couple then
    return v_target_couple;
  end if;

  if v_my_couple is not null and (select count(*) from public.couple_members where couple_id = v_my_couple) > 1 then
    raise exception 'บัญชีนี้แชร์สมุดกับคนอื่นอยู่แล้วนะ';
  end if;

  select
    coalesce((select count(*) from public.anniversaries where couple_id = v_my_couple), 0)
    + coalesce((select count(*) from public.letters where couple_id = v_my_couple), 0)
    + coalesce((select count(*) from public.gallery_images where couple_id = v_my_couple), 0)
    + coalesce((
        select count(*) from public.couple_settings
        where couple_id = v_my_couple
          and (
            relationship_start_date is not null
            or couple_photo_url is not null
            or my_avatar_url is not null
            or partner_avatar_url is not null
            or my_name <> 'ฉัน'
            or partner_name <> 'เธอ'
          )
      ), 0)
  into v_my_data_count;

  if v_my_data_count > 0 then
    raise exception 'บัญชีนี้มีข้อมูลอยู่แล้วนะ เข้าร่วมสมุดเล่มอื่นไม่ได้ (ป้องกันข้อมูลหาย)';
  end if;

  select count(*) into v_target_member_count from public.couple_members where couple_id = v_target_couple;
  if v_target_member_count >= 2 then
    raise exception 'สมุดเล่มนี้มีคนแชร์ครบ 2 คนแล้วนะ';
  end if;

  if v_my_couple is not null then
    delete from public.couple_members where user_id = v_caller;
    delete from public.couples where id = v_my_couple;
  end if;

  insert into public.couple_members (couple_id, user_id, role) values (v_target_couple, v_caller, 'member');

  return v_target_couple;
end;
$$;

revoke execute on function public.join_couple(text) from public, anon;
grant execute on function public.join_couple(text) to authenticated;

create or replace function public.regenerate_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_couple uuid;
  v_code text;
begin
  if v_caller is null then
    raise exception 'not authenticated';
  end if;

  select couple_id into v_couple from public.couple_members where user_id = v_caller;
  if v_couple is null then
    raise exception 'ยังไม่มีสมุดเลยนะ';
  end if;

  v_code := substr(md5(random()::text || clock_timestamp()::text), 1, 8);
  update public.couples set invite_code = v_code where id = v_couple;

  return v_code;
end;
$$;

revoke execute on function public.regenerate_invite_code() from public, anon;
grant execute on function public.regenerate_invite_code() to authenticated;

-- ---------------------------------------------------------------------
-- anniversaries
-- ---------------------------------------------------------------------
create table if not exists public.anniversaries (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  month_number int not null,
  title text not null,
  anniversary_date date not null,
  message text,
  cover_image_url text,
  photo_layout text not null default 'single' check (photo_layout in ('single', 'grid', 'stack')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists anniversaries_couple_id_date_idx
  on public.anniversaries (couple_id, anniversary_date);
create index if not exists anniversaries_user_id_idx
  on public.anniversaries (user_id);

create trigger anniversaries_set_updated_at
  before update on public.anniversaries
  for each row execute function public.set_updated_at();

alter table public.anniversaries enable row level security;

create policy "anniversaries_select_member" on public.anniversaries
  for select using (couple_id = (select public.my_couple_id()));
create policy "anniversaries_insert_member" on public.anniversaries
  for insert with check (couple_id = (select public.my_couple_id()));
create policy "anniversaries_update_member" on public.anniversaries
  for update using (couple_id = (select public.my_couple_id())) with check (couple_id = (select public.my_couple_id()));
create policy "anniversaries_delete_member" on public.anniversaries
  for delete using (couple_id = (select public.my_couple_id()));

-- ---------------------------------------------------------------------
-- anniversary_images
-- ---------------------------------------------------------------------
create table if not exists public.anniversary_images (
  id uuid primary key default gen_random_uuid(),
  anniversary_id uuid not null references public.anniversaries (id) on delete cascade,
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists anniversary_images_anniversary_id_idx
  on public.anniversary_images (anniversary_id, sort_order);
create index if not exists anniversary_images_couple_id_idx
  on public.anniversary_images (couple_id);
create index if not exists anniversary_images_user_id_idx
  on public.anniversary_images (user_id);

alter table public.anniversary_images enable row level security;

create policy "anniversary_images_select_member" on public.anniversary_images
  for select using (couple_id = (select public.my_couple_id()));
create policy "anniversary_images_insert_member" on public.anniversary_images
  for insert with check (
    couple_id = (select public.my_couple_id())
    and exists (
      select 1 from public.anniversaries a
      where a.id = anniversary_id and a.couple_id = (select public.my_couple_id())
    )
  );
create policy "anniversary_images_update_member" on public.anniversary_images
  for update using (couple_id = (select public.my_couple_id())) with check (couple_id = (select public.my_couple_id()));
create policy "anniversary_images_delete_member" on public.anniversary_images
  for delete using (couple_id = (select public.my_couple_id()));

-- ---------------------------------------------------------------------
-- letters
-- ---------------------------------------------------------------------
create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null,
  letter_date date not null default current_date,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists letters_couple_id_date_idx
  on public.letters (couple_id, letter_date desc);
create index if not exists letters_user_id_idx
  on public.letters (user_id);

create trigger letters_set_updated_at
  before update on public.letters
  for each row execute function public.set_updated_at();

alter table public.letters enable row level security;

create policy "letters_select_member" on public.letters
  for select using (couple_id = (select public.my_couple_id()));
create policy "letters_insert_member" on public.letters
  for insert with check (couple_id = (select public.my_couple_id()));
create policy "letters_update_member" on public.letters
  for update using (couple_id = (select public.my_couple_id())) with check (couple_id = (select public.my_couple_id()));
create policy "letters_delete_member" on public.letters
  for delete using (couple_id = (select public.my_couple_id()));

-- ---------------------------------------------------------------------
-- gallery_images
-- ---------------------------------------------------------------------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_couple_id_idx
  on public.gallery_images (couple_id, created_at desc);
create index if not exists gallery_images_user_id_idx
  on public.gallery_images (user_id);

alter table public.gallery_images enable row level security;

create policy "gallery_images_select_member" on public.gallery_images
  for select using (couple_id = (select public.my_couple_id()));
create policy "gallery_images_insert_member" on public.gallery_images
  for insert with check (couple_id = (select public.my_couple_id()));
create policy "gallery_images_update_member" on public.gallery_images
  for update using (couple_id = (select public.my_couple_id())) with check (couple_id = (select public.my_couple_id()));
create policy "gallery_images_delete_member" on public.gallery_images
  for delete using (couple_id = (select public.my_couple_id()));

-- =====================================================================
-- Storage: love-book-images bucket
-- =====================================================================
-- Path convention (unchanged): {user_id}/anniversaries/{anniversary_id}/{filename}
--                                {user_id}/letters/{letter_id}/{filename}
--                                {user_id}/gallery/{filename}
--                                {user_id}/settings/{filename}
-- The first path segment is always the uploader's own auth.uid() — but
-- the policies below grant access to that folder to EVERY member of the
-- uploader's couple, not just the uploader, so a partner's pre-existing
-- uploads keep working the moment they join with no files needing to move.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'love-book-images',
  'love-book-images',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "love_book_images_storage_select_member"
  on storage.objects for select
  using (
    bucket_id = 'love-book-images'
    and (storage.foldername(name))[1] in (
      select user_id::text from public.couple_members where couple_id = (select public.my_couple_id())
    )
  );

create policy "love_book_images_storage_insert_member"
  on storage.objects for insert
  with check (
    bucket_id = 'love-book-images'
    and (storage.foldername(name))[1] in (
      select user_id::text from public.couple_members where couple_id = (select public.my_couple_id())
    )
  );

create policy "love_book_images_storage_update_member"
  on storage.objects for update
  using (
    bucket_id = 'love-book-images'
    and (storage.foldername(name))[1] in (
      select user_id::text from public.couple_members where couple_id = (select public.my_couple_id())
    )
  )
  with check (
    bucket_id = 'love-book-images'
    and (storage.foldername(name))[1] in (
      select user_id::text from public.couple_members where couple_id = (select public.my_couple_id())
    )
  );

create policy "love_book_images_storage_delete_member"
  on storage.objects for delete
  using (
    bucket_id = 'love-book-images'
    and (storage.foldername(name))[1] in (
      select user_id::text from public.couple_members where couple_id = (select public.my_couple_id())
    )
  );

-- Bucket is public for read (simplifies serving images via CDN URL);
-- the policies above still gate writes/deletes to couple members.
-- If you'd rather keep photos fully private, set `public = false` above
-- and switch the app to use signed URLs instead of public URLs.
