# Supabase setup (content backend)

Supabase stores the website's content (services, texts, photos, certificates, business details, testimonials,
contact messages). The client edits it in the Supabase dashboard; the website loads it automatically.
If Supabase is ever unavailable, the website still shows its built-in content.

You do this once, in about 20 minutes.

---

## 1. Create the Supabase project (EU, Frankfurt)

1. Go to https://supabase.com and click **Start your project**. Sign up (GitHub login is easiest).
2. Click **New project** (create an organization first if asked, "Personal" is fine).
3. Fill in:
   - **Name:** `tosh-allround-services`
   - **Database password:** click *Generate a password* and **save it in your password manager** (you rarely need it, but you cannot see it again).
   - **Region:** **Central EU (Frankfurt)** ← important for GDPR. (Shown as `eu-central-1`.)
   - Plan: Free is enough to start.
4. Click **Create new project** and wait 1–2 minutes until it says the project is ready.

## 2. Find the keys

1. In the project, open **Project Settings** (gear icon, bottom left) → **API** (or **API Keys**).
2. Copy:
   - **Project URL**, e.g. `https://abcdefgh.supabase.co`  → `VITE_SUPABASE_URL`
   - **anon / public key** (long text starting with `eyJ…`; newer projects may call it the *publishable* key) → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** (click *Reveal*) → `SUPABASE_SERVICE_ROLE_KEY`. This one is a **master key that bypasses all security**: never share it, never commit it, never put it in Vercel. It is only needed for the one-time seed script on your computer.
3. In the project folder, copy `.env.example` to a new file named `.env` and paste the values:
   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   VITE_WEB3FORMS_KEY=...            (from the contact form setup)
   ```
   `.env` is git-ignored, so it is never uploaded to GitHub.

## 3. Create the tables and security rules

1. In Supabase open **SQL Editor** → **New query**.
2. Open `supabase/migrations/001_init.sql` from this project, copy **everything**, paste it into the editor, click **Run**.
3. You should see "Success. No rows returned". (A notice about `pg_cron` is explained in step 7.)

This creates all tables, turns on Row Level Security everywhere, creates the two storage buckets
(`site-images`, `documents`) and the rules described below. It is safe to run again.

### What visitors can and cannot do
| | Visitors (the public website) | Admin (Daniel) |
| --- | --- | --- |
| Read visible content (services, photos, texts …) | yes | yes (also hidden / deleted) |
| Send a contact message | yes (insert only, with length limits) | – |
| Read, change or delete anything else | **no** | yes |
| Read the contact messages | **no** | yes |
| Upload / delete images and PDFs | **no** | yes |

## 4. Create Daniel's admin account

1. **Authentication → Users → Add user → Create new user.**
   - Email: Daniel's email address
   - Password: a long, unique one (he stores it in a password manager)
   - Tick **Auto Confirm User**.
2. **SQL Editor → New query**, run (use Daniel's real email):
   ```sql
   select public.make_admin('daniel@example.com');
   ```
   It answers `OK: daniel@example.com is now an admin`.
3. **Disable public sign-ups** so nobody else can ever create an account:
   **Authentication → Sign In / Providers** (older UI: *Settings*) → switch **Allow new users to sign up** **OFF** → Save.

There is exactly one admin. Even if sign-ups were enabled by accident, a new user would still not be an admin
(only users listed in the `admins` table can change anything).

## 5. Load the current website content

In a terminal, in the project folder:

```bash
npm install
npm run seed
```

This copies all current content (5 services, texts, photos, the certificate, CV entries, business details) and uploads
all images and PDFs to Storage. Running it again is safe: it only adds what is missing and never overwrites edits
(`npm run seed -- --force` overwrites on purpose). Then restart `npm run dev`: the site now loads from Supabase.

After seeding you can delete `SUPABASE_SERVICE_ROLE_KEY` from `.env`.

## 6. Put the keys on Vercel

Vercel → your project → **Settings → Environment Variables**: add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
(and `VITE_WEB3FORMS_KEY`). Then **Redeploy** (Vite bakes the values in at build time). Do **not** add the service_role key.

## 7. Delete contact messages after 12 months (privacy)

The migration schedules a daily job that deletes messages older than 12 months. It needs the `pg_cron` extension:

1. **Database → Extensions** → search `pg_cron` → switch it **on**.
2. Run `supabase/migrations/001_init.sql` once more (or just the last block, "privacy: delete contact messages after 12 months").
3. Check in the SQL editor: `select jobname, schedule from cron.job;` shows `delete-old-messages`.

This is promised in the Datenschutz page, so please make sure it is active.

---

## 8. Set up the admin panel login (once)

Daniel edits the website at **https://toshallroundservices.de/admin** (see ADMIN_GUIDE.md; the same guide is inside the panel under "Hilfe"). It uses the account from step 4. Two Supabase settings make the "Passwort vergessen?" e-mail work:

1. **Authentication → URL Configuration:**
   - **Site URL:** `https://toshallroundservices.de`
   - **Redirect URLs:** add `https://toshallroundservices.de/admin` (and `http://localhost:5173/admin` for local testing).
2. **Custom SMTP (important):** Supabase's built-in mail service only delivers to members of *your* Supabase organization and is heavily rate limited. So that a reset e-mail also reaches Daniel, set up your own sender under **Authentication → Emails → SMTP Settings** (e.g. an EU provider such as Brevo or Mailjet, or the Gmail/Workspace SMTP of the business address) and use it for the "Reset password" template.
   - If you skip this: you can always set a new password for Daniel yourself in **Authentication → Users → ⋯ → Send password recovery / Reset password** (or delete and recreate the user, then run `select public.make_admin('…')` again).

Test it once: open `/admin`, log in, change a text, click "Website ansehen" – and try "Passwort vergessen?".

Security notes: the panel is only a convenience. What Daniel may do is decided by the database rules (RLS) – only the user in the `admins` table can write or read messages, and sign-ups are off. The admin session lives in the browser of the device he logs in on (until he logs out).

## Managing content directly in Supabase (alternative to the admin panel)

Everything the admin panel does can also be done in the Supabase dashboard (https://supabase.com/dashboard → the project).

**Table Editor** (left menu) – click a table, then edit cells or **Insert row**:

| Table | What it controls |
| --- | --- |
| `services` | The services: titles / descriptions in German and English, `included_de` / `included_en` (lists), `price_from`, image, `is_specialty` (only one should be true), `is_visible`, `sort_order` |
| `gallery_photos` | Gallery. `is_visible` hides a photo; `deleted_at` (set a date) removes it softly, clear it to restore. `is_featured` puts it in the home preview. `sort_order` = order. `category` must be one of: homes, offices, shops, staircases, it, care |
| `site_texts` | Headlines and paragraphs (see the list below). Leave a language empty to keep the built-in text |
| `business_info` | Phone, WhatsApp, email, address, opening hours, and the **announcement** banner (`announcement_active` = true shows it) |
| `testimonials` | Customer quotes. The section on the home page appears automatically when at least one is visible |
| `certificates` | Qualification documents and their scans / PDFs |
| `cv_entries` | The founder's CV: `type` = experience, education, language or skill |
| `messages` | Contact form messages. `is_read` to tick them off |

**Storage** (left menu) – the buckets `site-images` (photos) and `documents` (PDFs). Upload a file, then write its
path (e.g. `gallery/new-photo.webp`) into the `image_path` column of the row. Tips:
- Use WebP, about 1400 px on the long side, under 300 KB.
- Fill in `width` and `height` (pixels) so the page does not jump while loading. Optional: a smaller copy for phones in `image_path_sm` + `sm_width`.
- Always write German **and** English `alt` text (what the photo shows).
- `position` (e.g. `50% 25%`) keeps faces in view when a tall photo is cropped.

**Before / after photos:** (in the admin panel: Galerie → Vorher/Nachher erstellen) upload both photos as normal rows. On the *after* row, set `before_after_pair_id` to the
`id` of the *before* row. The before photo disappears from the grid and appears as a slider in the lightbox.

**Editable text keys** (`site_texts.key`): `hero_eyebrow`, `hero_title`, `hero_text`, `tagline`, `services_intro`,
`why_text`, `gallery_intro`, `cta_title`, `cta_text`, `about_welcome`, `about_text_1`, `about_text_2`, `mission_text`,
`founder_profile`, `founder_education_note`, `contact_intro`, `founder_cv_pdf` (path of the CV PDF in the `documents` bucket).
Other keys are ignored.

Changes appear on the website for new visitors within moments; returning visitors see them on their next visit
(the previous version is shown instantly while the new one loads).

## Troubleshooting

- **The site shows old content / the built-in content:** check `.env` / Vercel variables, that you ran the SQL and the seed, and the browser console (a message starting with `[content]` explains why the fallback is used).
- **Seed says "Did you run 001_init.sql first?":** run step 3.
- **Contact messages do not arrive in `messages`:** the email (Web3Forms) still works as a backup. Check the SQL ran without errors and that the message was at least 10 characters.
- **Changing security rules:** edit `supabase/migrations/001_init.sql`, run `npm run test:db` (66 automatic checks), then run the file again in the SQL editor.
