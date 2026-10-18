/**
 * Seeds Supabase with the website's CURRENT content (the same data the site shows without a database):
 * services, site texts, business info, gallery photos (real + placeholders), certificate, CV entries, and uploads
 * the image / PDF files to Storage.
 *
 *   npm run seed              insert whatever is missing (never overwrites edits made in Supabase)
 *   npm run seed -- --force   overwrite existing rows with the built-in content again
 *   npm run seed -- --dry-run check files and rows without connecting to Supabase
 *
 * Needs in .env:  VITE_SUPABASE_URL  and  SUPABASE_SERVICE_ROLE_KEY  (Project Settings → API → service_role).
 * The service_role key bypasses all security: NEVER put it in a VITE_ variable or commit it. .env is git-ignored.
 */
import { readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { buildSeed } from './seed-data'

const args = new Set(process.argv.slice(2))
const DRY = args.has('--dry-run')
const FORCE = args.has('--force')
const root = join(import.meta.dirname, '..')

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!DRY && (!url || !serviceKey)) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env (see SUPABASE_SETUP.md).')
  process.exit(1)
}
const db = DRY ? null : createClient(url!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } })

const MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.avif': 'image/avif',
}

const { services, gallery, texts, certificates, cv, business, uploads, missingFiles } = buildSeed(root)

console.log(
  `Content: ${services.length} services, ${gallery.length} gallery photos, ${texts.length} texts, ${certificates.length} certificate(s), ${cv.length} CV entries, ${uploads.size} files`,
)
if (missingFiles) {
  console.error(`\n${missingFiles} file(s) missing, nothing was changed.`)
  process.exit(1)
}
if (DRY) {
  console.log('Dry run OK: all files exist and all rows can be built. Nothing was sent to Supabase.')
  process.exit(0)
}

// ---------- upload files ----------
console.log('\nUploading files…')
let up = 0
for (const { bucket, key, file: abs } of uploads.values()) {
  const { error } = await db!.storage.from(bucket).upload(key, readFileSync(abs), {
    upsert: true,
    contentType: MIME[extname(abs).toLowerCase()] ?? 'application/octet-stream',
    cacheControl: '2592000',
  })
  if (error) {
    console.error(`  ✗ ${bucket}/${key}: ${error.message}`)
    process.exit(1)
  }
  up++
}
console.log(`  ✓ ${up} files uploaded`)

// ---------- insert rows (missing only, unless --force) ----------
async function seed<T extends Record<string, unknown>>(table: string, rows: T[], matchOn: (keyof T & string)[]) {
  const { data: existing, error } = await db!.from(table).select(matchOn.join(','))
  if (error) throw new Error(`${table}: ${error.message}`)
  const sig = (r: Record<string, unknown>) => matchOn.map((k) => String(r[k])).join('|')
  const have = new Set((existing as unknown as Record<string, unknown>[]).map(sig))
  const toInsert = rows.filter((r) => !have.has(sig(r)))
  const toUpdate = FORCE ? rows.filter((r) => have.has(sig(r))) : []
  if (toInsert.length) {
    const { error: e } = await db!.from(table).insert(toInsert)
    if (e) throw new Error(`${table}: ${e.message}`)
  }
  for (const r of toUpdate) {
    let q = db!.from(table).update(r)
    for (const k of matchOn) q = q.eq(k, r[k] as never)
    const { error: e } = await q
    if (e) throw new Error(`${table}: ${e.message}`)
  }
  console.log(`  ✓ ${table}: ${toInsert.length} inserted${FORCE ? `, ${toUpdate.length} overwritten` : `, ${rows.length - toInsert.length} already there`}`)
}

console.log('\nWriting rows…')
try {
  await seed('services', services, ['slug'])
  await seed('site_texts', texts, ['key'])
  await seed('business_info', [business], ['id'])
  await seed('gallery_photos', gallery, ['image_path'])
  await seed('certificates', certificates, ['title_de', 'year'])
  await seed('cv_entries', cv, ['type', 'title_de'])
  console.log('\nDone. Open the website: it now loads this content from Supabase.')
} catch (err) {
  console.error('\n✗', (err as Error).message)
  console.error('Did you run supabase/migrations/001_init.sql first?')
  process.exit(1)
}
