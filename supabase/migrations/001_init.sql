-- =====================================================================================
-- Tosh Allround Services – content backend (Supabase / Postgres)
--
-- HOW TO RUN: Supabase dashboard → SQL Editor → New query → paste this whole file → Run.
-- Safe to run more than once (it uses "if not exists" / "or replace" / drop-and-recreate for policies).
--
-- SECURITY MODEL
--   * Row Level Security (RLS) is ON for every table.
--   * The public website ("anon" role) can only READ content that is visible and not deleted, and can only
--     INSERT into `messages` (with length limits). It can never update/delete anything or read messages.
--   * Only the admin (a row in `admins`, see the end of this file) can create / update / delete content,
--     upload files and read messages.
--   * Storage: public read for the two buckets, write only for the admin.
-- =====================================================================================

-- ---------- helpers -------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- the admin list (one row = one admin user). Nobody can read/write it through the API.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- run once, from this SQL editor, to make an existing user the admin: select public.make_admin('daniel@example.com');
create or replace function public.make_admin(admin_email text)
returns text
language plpgsql security definer
set search_path = public, auth
as $$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(admin_email);
  if uid is null then
    raise exception 'No user with email % – create the user first (Authentication → Users → Add user).', admin_email;
  end if;
  insert into public.admins (user_id) values (uid) on conflict do nothing;
  return 'OK: ' || admin_email || ' is now an admin';
end $$;
revoke all on function public.make_admin(text) from public, anon, authenticated;

-- ---------- tables --------------------------------------------------------------------

-- Gallery photos. A before/after pair: the AFTER photo points at its BEFORE photo with before_after_pair_id;
-- the BEFORE photo is then not shown separately in the grid.
create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sort_order integer not null default 0,
  image_path text not null,                -- path inside the "site-images" bucket (or a /local/path for built-in files)
  image_path_sm text,                      -- optional smaller copy for phones
  width integer check (width > 0),         -- pixel size (prevents layout shift)
  height integer check (height > 0),
  sm_width integer check (sm_width > 0),
  position text,                           -- focal point for cropping, e.g. '50% 25%'
  category text not null check (category in ('homes', 'offices', 'shops', 'staircases', 'it', 'care')),
  caption_de text,
  caption_en text,
  alt_de text not null default '',
  alt_en text not null default '',
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  is_placeholder boolean not null default false,  -- true = stock photo that should be replaced
  before_after_pair_id uuid references public.gallery_photos (id) on delete set null,
  deleted_at timestamptz                   -- soft delete: set to hide permanently, clear to restore
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sort_order integer not null default 0,
  slug text not null unique,               -- stable identifier, e.g. 'residential'
  icon text not null default 'Sparkles',   -- Home | Building2 | Store | Layers | Monitor | Sparkles
  title_de text not null,
  title_en text not null,
  description_de text not null,            -- short text for the cards
  description_en text not null,
  details_de text,                         -- optional longer text for the Services page
  details_en text,
  included_de text[] not null default '{}',
  included_en text[] not null default '{}',
  price_from text,                         -- e.g. 'ab 25 € / Stunde'
  image_path text,
  image_path_sm text,
  image_width integer,
  image_height integer,
  image_sm_width integer,
  image_position text,
  image_alt_de text not null default '',
  image_alt_en text not null default '',
  extra_image jsonb,                       -- optional 2nd (collage) photo: {path,path_sm,width,height,sm_width,position,alt_de,alt_en}
  is_specialty boolean not null default false,
  is_visible boolean not null default true
);

create table if not exists public.site_texts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  key text not null unique,                -- e.g. hero_title, tagline, about_text_1, founder_profile
  value_de text not null default '',
  value_en text not null default ''
);

-- exactly one row (id is always 1)
create table if not exists public.business_info (
  id integer primary key default 1 check (id = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  phone text not null,
  whatsapp text not null,
  email text not null,
  address jsonb not null,                  -- {"street":"…","zip":"…","city":"…","country":"…"}
  opening_hours jsonb not null,            -- {"mon":{"open":"08:00","close":"18:00"},…,"sun":null}
  announcement_de text,
  announcement_en text,
  announcement_active boolean not null default false
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sort_order integer not null default 0,
  name text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  text_de text not null default '',
  text_en text not null default '',
  is_visible boolean not null default true
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sort_order integer not null default 0,
  title_de text not null,
  title_en text not null,
  institution text not null,
  year text not null,
  image_path text,                         -- full-size scan (site-images bucket)
  image_width integer,
  image_height integer,
  thumb_path text,                         -- small preview (site-images bucket)
  thumb_width integer,
  thumb_height integer,
  pdf_path text,                           -- PDF (documents bucket)
  alt_de text not null default '',
  alt_en text not null default '',
  is_visible boolean not null default true
);

create table if not exists public.cv_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sort_order integer not null default 0,
  type text not null check (type in ('experience', 'education', 'language', 'skill')),
  title_de text not null,
  title_en text not null,
  place text,
  years text,
  details_de text,
  details_en text,
  is_highlight boolean not null default false  -- highlighted chip (e.g. the IT specialty skill)
);

-- contact form submissions
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  phone text check (phone is null or char_length(phone) <= 40),
  email text not null check (char_length(email) between 5 and 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  service text check (service is null or char_length(service) <= 120),
  message text not null check (char_length(btrim(message)) between 10 and 4000),
  is_read boolean not null default false
);

create index if not exists gallery_photos_order_idx on public.gallery_photos (sort_order);
create index if not exists services_order_idx on public.services (sort_order);
create index if not exists messages_created_idx on public.messages (created_at desc);

-- keep updated_at fresh
do $$
declare t text;
begin
  foreach t in array array['gallery_photos','services','site_texts','business_info','testimonials','certificates','cv_entries']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- row level security -------------------------------------------------------

alter table public.gallery_photos enable row level security;
alter table public.services enable row level security;
alter table public.site_texts enable row level security;
alter table public.business_info enable row level security;
alter table public.testimonials enable row level security;
alter table public.certificates enable row level security;
alter table public.cv_entries enable row level security;
alter table public.messages enable row level security;

-- (re)create all policies
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies
           where schemaname = 'public'
             and tablename in ('gallery_photos','services','site_texts','business_info','testimonials','certificates','cv_entries','messages')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- PUBLIC (anon + logged-in) can read only what should be visible
create policy "public read visible photos" on public.gallery_photos for select to anon, authenticated
  using (is_visible and deleted_at is null);
create policy "public read visible services" on public.services for select to anon, authenticated
  using (is_visible);
create policy "public read texts" on public.site_texts for select to anon, authenticated using (true);
create policy "public read business info" on public.business_info for select to anon, authenticated using (true);
create policy "public read visible testimonials" on public.testimonials for select to anon, authenticated
  using (is_visible);
create policy "public read visible certificates" on public.certificates for select to anon, authenticated
  using (is_visible);
create policy "public read cv" on public.cv_entries for select to anon, authenticated using (true);

-- PUBLIC may only INSERT contact messages (length limits are enforced again by the table constraints)
create policy "public can send messages" on public.messages for insert to anon, authenticated
  with check (
    is_read = false
    and char_length(btrim(name)) between 2 and 120
    and char_length(btrim(message)) between 10 and 4000
    and char_length(email) between 5 and 200
  );

-- ADMIN can do everything (including seeing hidden/deleted rows and reading messages)
create policy "admin all photos" on public.gallery_photos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin all services" on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin all texts" on public.site_texts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin all business info" on public.business_info for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin all testimonials" on public.testimonials for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin all certificates" on public.certificates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin all cv" on public.cv_entries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin read messages" on public.messages for select to authenticated using (public.is_admin());
create policy "admin update messages" on public.messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin delete messages" on public.messages for delete to authenticated using (public.is_admin());

-- table privileges: anon gets the minimum (RLS then narrows it further)
revoke all on public.gallery_photos, public.services, public.site_texts, public.business_info,
  public.testimonials, public.certificates, public.cv_entries, public.messages from anon, authenticated;
grant select on public.gallery_photos, public.services, public.site_texts, public.business_info,
  public.testimonials, public.certificates, public.cv_entries to anon, authenticated;
grant insert on public.messages to anon, authenticated;
grant insert, update, delete on public.gallery_photos, public.services, public.site_texts, public.business_info,
  public.testimonials, public.certificates, public.cv_entries to authenticated;
grant select, update, delete on public.messages to authenticated;

-- ---------- one request for the whole website ---------------------------------------
-- The website loads everything with a single call. It runs with the caller's rights, so RLS applies:
-- visitors only get visible, non-deleted rows.
create or replace function public.get_public_content()
returns jsonb
language sql stable
as $$
  select jsonb_build_object(
    'services',     coalesce((select jsonb_agg(to_jsonb(s) order by s.sort_order, s.created_at) from public.services s), '[]'::jsonb),
    'gallery',      coalesce((select jsonb_agg(to_jsonb(g) order by g.sort_order, g.created_at) from public.gallery_photos g), '[]'::jsonb),
    'texts',        coalesce((select jsonb_agg(to_jsonb(t)) from public.site_texts t), '[]'::jsonb),
    'business',     (select to_jsonb(b) from public.business_info b where b.id = 1),
    'testimonials', coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order, x.created_at) from public.testimonials x), '[]'::jsonb),
    'certificates', coalesce((select jsonb_agg(to_jsonb(c) order by c.sort_order, c.created_at) from public.certificates c), '[]'::jsonb),
    'cv',           coalesce((select jsonb_agg(to_jsonb(v) order by v.sort_order, v.created_at) from public.cv_entries v), '[]'::jsonb)
  );
$$;
grant execute on function public.get_public_content() to anon, authenticated;

-- ---------- storage -------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-images', 'site-images', true, 10485760, array['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'image/svg+xml']),
  ('documents',   'documents',   true, 20971520, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read site images and documents" on storage.objects;
drop policy if exists "admin upload site images and documents" on storage.objects;
drop policy if exists "admin update site images and documents" on storage.objects;
drop policy if exists "admin delete site images and documents" on storage.objects;

create policy "public read site images and documents" on storage.objects for select to anon, authenticated
  using (bucket_id in ('site-images', 'documents'));
create policy "admin upload site images and documents" on storage.objects for insert to authenticated
  with check (bucket_id in ('site-images', 'documents') and public.is_admin());
create policy "admin update site images and documents" on storage.objects for update to authenticated
  using (bucket_id in ('site-images', 'documents') and public.is_admin())
  with check (bucket_id in ('site-images', 'documents') and public.is_admin());
create policy "admin delete site images and documents" on storage.objects for delete to authenticated
  using (bucket_id in ('site-images', 'documents') and public.is_admin());

-- ---------- privacy: delete contact messages after 12 months -----------------------
-- Uses the pg_cron extension. If it is not available yet, enable it in
-- Database → Extensions → pg_cron and run this block again.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'delete-old-messages';
  perform cron.schedule(
    'delete-old-messages',
    '17 3 * * *',
    $job$delete from public.messages where created_at < now() - interval '12 months'$job$
  );
exception when others then
  raise notice 'pg_cron is not enabled, so old messages will NOT be deleted automatically: %', sqlerrm;
end $$;

-- =====================================================================================
-- AFTER RUNNING THIS FILE
--   1. Authentication → Users → Add user (Daniel's email + password, tick "Auto Confirm User").
--   2. Run in the SQL editor:   select public.make_admin('daniel@example.com');
--   3. Authentication → Sign In / Providers → turn OFF "Allow new users to sign up".
-- =====================================================================================
