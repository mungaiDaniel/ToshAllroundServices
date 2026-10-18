import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'

/**
 * Security tests for supabase/migrations/001_init.sql, run on a real Postgres engine (PGlite) with stand-ins for
 * Supabase's roles. Tries to break in as an anonymous visitor, a non-admin user and the admin.
 * Run:  npm run test:db      (re-run after every change to policies!)
 */
import { fileURLToPath } from 'node:url'
const sql = readFileSync(fileURLToPath(new URL('../migrations/001_init.sql', import.meta.url)), 'utf-8')
const db = new PGlite()
let pass = 0, fail = 0
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log((cond ? 'PASS' : 'FAIL') + '  ' + name + (extra ? '  ' + extra : '')) }

// ---- minimal stand-ins for what Supabase provides ----
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth; create schema storage;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[], created_at timestamptz default now());
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema auth, storage, public to anon, authenticated;
  grant select, insert, update, delete on storage.objects to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`)

// ---- run the migration twice (must be idempotent) ----
await db.exec(sql)
await db.exec(sql)
ok('migration runs (twice, idempotent)', true)

// ---- sample data (as superuser) ----
await db.exec(`
  insert into services (slug,title_de,title_en,description_de,description_en,is_visible) values
    ('a','A','A','d','d',true), ('b','B','B','d','d',false);
  insert into gallery_photos (image_path,category,alt_de,alt_en,is_visible,deleted_at) values
    ('/x/1.webp','homes','a','a',true,null),
    ('/x/2.webp','homes','a','a',false,null),
    ('/x/3.webp','homes','a','a',true,now());
  insert into site_texts (key,value_de,value_en) values ('tagline','x','y');
  insert into business_info (phone,whatsapp,email,address,opening_hours) values ('1','2','a@b.de','{}'::jsonb,'{}'::jsonb);
  insert into testimonials (name,text_de,text_en,is_visible) values ('T1','a','a',true),('T2','a','a',false);
  insert into certificates (title_de,title_en,institution,year,is_visible) values ('C1','C1','I','2000',true),('C2','C2','I','2000',false);
  insert into cv_entries (type,title_de,title_en) values ('skill','s','s');
  insert into messages (name,email,message) values ('Existing','e@x.de','existing message text');
  insert into auth.users (id,email) values ('11111111-1111-1111-1111-111111111111','daniel@example.com'),('22222222-2222-2222-2222-222222222222','other@example.com');
`)
const asRole = async (role, sub = '') => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${sub}', false); set role ${role};`)
}
const tryQ = async (q) => { try { const r = await db.query(q); return { ok: true, rows: r.rows, affected: r.affectedRows } } catch (e) { return { ok: false, err: String(e.message).slice(0, 90) } } }

// ---- anonymous visitor ----
await asRole('anon')
let r = await tryQ('select count(*)::int c from gallery_photos'); ok('anon sees only visible, non-deleted photos', r.ok && r.rows[0].c === 1, JSON.stringify(r.rows))
r = await tryQ('select count(*)::int c from services'); ok('anon sees only visible services', r.ok && r.rows[0].c === 1)
r = await tryQ('select count(*)::int c from testimonials'); ok('anon sees only visible testimonials', r.ok && r.rows[0].c === 1)
r = await tryQ('select count(*)::int c from certificates'); ok('anon sees only visible certificates', r.ok && r.rows[0].c === 1)
r = await tryQ('select count(*)::int c from site_texts'); ok('anon reads texts', r.ok && r.rows[0].c === 1)
r = await tryQ('select count(*)::int c from business_info'); ok('anon reads business info', r.ok && r.rows[0].c === 1)
r = await tryQ('select count(*)::int c from messages'); ok('anon CANNOT read messages', !r.ok, r.err)
r = await tryQ('select * from admins'); ok('anon CANNOT read admins', !r.ok, r.err)
r = await tryQ(`insert into messages (name,email,message) values ('Anna','anna@example.de','Hello, a valid message here')`); ok('anon can insert a valid message', r.ok, r.err)
r = await tryQ(`insert into messages (name,email,message) values ('A','anna@example.de','Hello, a valid message here')`); ok('anon CANNOT insert too-short name', !r.ok, r.err)
r = await tryQ(`insert into messages (name,email,message) values ('Anna','anna@example.de','short')`); ok('anon CANNOT insert too-short message', !r.ok, r.err)
r = await tryQ(`insert into messages (name,email,message) values ('Anna','not-an-email','Hello, a valid message here')`); ok('anon CANNOT insert invalid email', !r.ok, r.err)
r = await tryQ(`insert into messages (name,email,message) values ('Anna','anna@example.de','${'x'.repeat(4001)}')`); ok('anon CANNOT insert >4000 char message', !r.ok, r.err)
r = await tryQ(`insert into messages (name,email,message,is_read) values ('Anna','anna@example.de','Hello, a valid message here', true)`); ok('anon CANNOT insert is_read=true', !r.ok, r.err)
r = await tryQ(`update messages set is_read = true`); ok('anon CANNOT update messages', !r.ok, r.err)
r = await tryQ(`delete from messages`); ok('anon CANNOT delete messages', !r.ok, r.err)
for (const t of ['services', 'gallery_photos', 'site_texts', 'business_info', 'testimonials', 'certificates', 'cv_entries']) {
  r = await tryQ(`update ${t} set created_at = now()`); ok(`anon CANNOT update ${t}`, !r.ok, r.err)
  r = await tryQ(`delete from ${t}`); ok(`anon CANNOT delete ${t}`, !r.ok, r.err)
}
r = await tryQ(`insert into services (slug,title_de,title_en,description_de,description_en) values ('z','z','z','z','z')`); ok('anon CANNOT insert services', !r.ok, r.err)
r = await tryQ(`insert into storage.objects (bucket_id,name) values ('site-images','evil.webp')`); ok('anon CANNOT upload to storage', !r.ok, r.err)
r = await tryQ(`select public.make_admin('other@example.com')`); ok('anon CANNOT call make_admin', !r.ok, r.err)
r = await tryQ(`select public.get_public_content() as c`)
const c = r.rows?.[0]?.c
ok('get_public_content works for anon and only returns public rows', r.ok && c.gallery.length === 1 && c.services.length === 1 && c.testimonials.length === 1 && c.certificates.length === 1 && c.business?.email === 'a@b.de', r.ok ? `gallery=${c.gallery.length} services=${c.services.length}` : r.err)
r = await tryQ(`select public.get_public_content()::text like '%existing message%' as leak`); ok('get_public_content does not leak messages', r.ok && r.rows[0].leak === false)

// ---- logged-in user who is NOT admin ----
await asRole('authenticated', '22222222-2222-2222-2222-222222222222')
r = await tryQ(`update services set title_de = 'hacked'`); ok('non-admin user CANNOT update services (0 rows)', r.ok ? r.affected === 0 : true, r.err || `affected=${r.affected}`)
r = await tryQ(`insert into services (slug,title_de,title_en,description_de,description_en) values ('z','z','z','z','z')`); ok('non-admin user CANNOT insert services', !r.ok, r.err)
r = await tryQ(`select count(*)::int c from messages`); ok('non-admin user reads 0 messages', r.ok && r.rows[0].c === 0, JSON.stringify(r.rows))
r = await tryQ(`insert into storage.objects (bucket_id,name) values ('site-images','evil2.webp')`); ok('non-admin user CANNOT upload to storage', !r.ok, r.err)
r = await tryQ(`insert into site_texts (key,value_de,value_en) values ('tagline','pwned','pwned') on conflict (key) do update set value_de = excluded.value_de`); ok('non-admin user CANNOT upsert site_texts', !r.ok, r.err)
r = await tryQ(`select public.is_admin() as a`); ok('rpc is_admin() is false for a normal user', r.ok && r.rows[0].a === false, JSON.stringify(r.rows))

// ---- the admin ----
await db.exec('reset role')
await db.exec(`select public.make_admin('daniel@example.com')`)
await asRole('authenticated', '11111111-1111-1111-1111-111111111111')
r = await tryQ(`update services set title_de = 'edited' where slug = 'a'`); ok('admin can update services', r.ok && r.affected === 1, r.err)
r = await tryQ(`select count(*)::int c from services`); ok('admin sees hidden services too', r.ok && r.rows[0].c === 2, JSON.stringify(r.rows))
r = await tryQ(`select count(*)::int c from gallery_photos`); ok('admin sees hidden + deleted photos', r.ok && r.rows[0].c === 3, JSON.stringify(r.rows))
r = await tryQ(`select count(*)::int c from messages`); ok('admin reads messages', r.ok && r.rows[0].c >= 2, JSON.stringify(r.rows))
r = await tryQ(`update messages set is_read = true`); ok('admin can mark messages read', r.ok && r.affected >= 2, r.err)
r = await tryQ(`insert into storage.objects (bucket_id,name) values ('site-images','ok.webp')`); ok('admin can upload to site-images', r.ok, r.err)
r = await tryQ(`insert into storage.objects (bucket_id,name) values ('private-stuff','x.webp')`); ok('admin CANNOT write to other buckets', !r.ok, r.err)
r = await tryQ(`update business_info set phone = '999' where id = 1`); ok('admin can update business info', r.ok && r.affected === 1, r.err)
r = await tryQ(`insert into business_info (id,phone,whatsapp,email,address,opening_hours) values (2,'1','2','a@b.de','{}','{}')`); ok('business_info is limited to a single row', !r.ok, r.err)

// the exact write patterns of the admin panel (src/admin): upserts, soft delete / restore, before/after link, deletes
r = await tryQ(`insert into business_info (id,phone,whatsapp,email,address,opening_hours,announcement_active,announcement_de) values (1,'1','+49 1','a@b.de','{}','{}',true,'Closed') on conflict (id) do update set phone = excluded.phone, announcement_active = excluded.announcement_active, announcement_de = excluded.announcement_de`)
ok('admin panel: upsert business_info (contact + announcement)', r.ok, r.err)
r = await tryQ(`insert into site_texts (key,value_de,value_en) values ('hero_title','Neu','New'), ('about_text_1','a','b') on conflict (key) do update set value_de = excluded.value_de, value_en = excluded.value_en`)
ok('admin panel: upsert site_texts (existing + new key)', r.ok, r.err)
r = await tryQ(`update gallery_photos set deleted_at = now() where image_path = '/x/1.webp'`); ok('admin panel: photo to trash (soft delete)', r.ok && r.affected === 1, r.err)
r = await tryQ(`update gallery_photos set deleted_at = null where image_path = '/x/1.webp'`); ok('admin panel: photo restored from trash', r.ok && r.affected === 1, r.err)
r = await tryQ(`insert into gallery_photos (image_path,image_path_sm,width,height,sm_width,category,caption_de,alt_de,alt_en,is_featured,sort_order) values ('gallery/n.webp','gallery/n-sm.webp',1600,1200,640,'offices','Büro','Büro','Offices',true,-10) returning id`)
ok('admin panel: insert uploaded photo row', r.ok, r.err)
r = await tryQ(`update gallery_photos set before_after_pair_id = (select id from gallery_photos where image_path = 'gallery/n.webp') where image_path = '/x/1.webp'`); ok('admin panel: link before/after photos', r.ok && r.affected === 1, r.err)
r = await tryQ(`delete from gallery_photos where image_path = 'gallery/n.webp'`); ok('admin panel: delete the "before" photo (pair link is cleared)', r.ok && r.affected === 1, r.err)
r = await tryQ(`select before_after_pair_id from gallery_photos where image_path = '/x/1.webp'`); ok('before/after link set to null by the foreign key', r.ok && r.rows[0].before_after_pair_id === null, JSON.stringify(r.rows))
r = await tryQ(`insert into testimonials (name,rating,text_de,text_en,sort_order) values ('Familie Meyer',4,'Gut','Good',10)`); ok('admin panel: add testimonial', r.ok, r.err)
r = await tryQ(`insert into certificates (title_de,title_en,institution,year,pdf_path,alt_de,alt_en) values ('Schulung','Training','IHK','2024','certificates/x.pdf','Schulung','Training')`); ok('admin panel: add PDF-only certificate', r.ok, r.err)
r = await tryQ(`insert into cv_entries (type,title_de,title_en,is_highlight,sort_order) values ('skill','Fenster','Windows',true,990)`); ok('admin panel: add CV entry', r.ok, r.err)
r = await tryQ(`delete from messages where is_read = true`); ok('admin panel: delete messages', r.ok, r.err)
r = await tryQ(`select public.is_admin() as a`); ok('rpc is_admin() is true for the admin (login check of the panel)', r.ok && r.rows[0].a === true, JSON.stringify(r.rows))
await db.exec('reset role')
r = await tryQ(`select updated_at > created_at as bumped from services where slug='a'`); ok('updated_at trigger works', r.ok && r.rows[0].bumped === true)
r = await tryQ(`select relname, relrowsecurity from pg_class where relname in ('gallery_photos','services','site_texts','business_info','testimonials','certificates','cv_entries','messages','admins') order by 1`)
ok('RLS enabled on all 9 tables', r.rows.length === 9 && r.rows.every((x) => x.relrowsecurity), r.rows.filter((x) => !x.relrowsecurity).map((x) => x.relname).join(','))
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
