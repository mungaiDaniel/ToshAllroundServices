# Deploying toshallroundservices.de (GitHub → Vercel → Squarespace DNS)

## 1. Put the project on GitHub

1. Create a free account at https://github.com and click **New repository** (name: `tosh-allround-services`, **Private**, do not add a README).
2. In the project folder, in a terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/tosh-allround-services.git
   git push -u origin main
   ```
3. `.env` (your secret key) is already ignored by git and is never uploaded. `node_modules` and `dist` are ignored too.
4. The folder `tosh-website-assets/` (original uploads) is not ignored. Keep the repository **private**, or add `tosh-website-assets/` to `.gitignore` before committing if you don't want it in GitHub.

## 2. Deploy on Vercel

1. Go to https://vercel.com, **Sign up with GitHub**, and approve access to the repository.
2. **Add New… → Project → Import** `tosh-allround-services`.
3. Vercel detects **Vite** automatically. Check: Build Command `npm run build`, Output Directory `dist`. Leave the rest.
4. Open **Environment Variables** and add (Production and Preview):
   - `VITE_WEB3FORMS_KEY` = your Web3Forms access key
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon (public) key
   - Do **not** add the `service_role` key. Set up Supabase first: see [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
5. Click **Deploy**. After about a minute you get a preview URL like `tosh-allround-services.vercel.app`. Open it and test every page and the contact form.
6. From now on every `git push` to `main` redeploys automatically. Changing an environment variable needs a **Redeploy** (Deployments → ⋯ → Redeploy) because Vite bakes it into the build.

`vercel.json` already makes page refreshes work (all routes fall back to the app), adds caching and security headers, and redirects `www.toshallroundservices.de` to `toshallroundservices.de`.

## 3. Connect the domain (registered at Squarespace Domains)

### In Vercel
1. Project → **Settings → Domains → Add**: enter `toshallroundservices.de`.
2. Add a second domain `www.toshallroundservices.de`. When asked, choose **Redirect to `toshallroundservices.de`** (308 permanent). The main (canonical) domain is the one **without** www.
3. Vercel now shows the DNS records it wants, with a red "Invalid Configuration" until DNS is set. **Use the exact values Vercel displays.** Typically:

   | Type | Host / Name | Value |
   | --- | --- | --- |
   | A | `@` | `76.76.21.21` (Vercel may show a newer IP – use theirs) |
   | CNAME | `www` | `cname.vercel-dns.com` (or the project-specific value Vercel shows) |

### In Squarespace Domains
1. Sign in at https://account.squarespace.com → **Domains** → click `toshallroundservices.de`.
2. Open **DNS → DNS Settings**.
3. Look at the existing records for the host `@` and `www`. **Delete any existing A, AAAA or CNAME records for `@` and `www`** (for example Squarespace's default website records). Keep **MX** and **TXT** records if you use email on this domain.
4. Under **Custom Records**, add:
   - **A** record: Host `@`, Data = the IP from Vercel.
   - **CNAME** record: Host `www`, Data = the value from Vercel.
5. Save. DNS usually updates within minutes, sometimes up to 24–48 hours.
6. Back in Vercel (Settings → Domains) both domains turn to **Valid Configuration**, and Vercel issues the HTTPS certificate automatically.

### Check
- `https://toshallroundservices.de` shows the site.
- `https://www.toshallroundservices.de` redirects to `https://toshallroundservices.de`.
- Refreshing `https://toshallroundservices.de/kontakt` works.

## 4. Before announcing the site

- [ ] Replace every `[bracketed]` placeholder in **Impressum** and **Datenschutz**, and have a legal generator or lawyer review them (see `src/i18n/legal/`). The yellow draft notice disappears once none are left.
- [ ] Set the real opening hours in `src/data/site.ts` (`hours`).
- [ ] Web3Forms + Supabase: add the keys (step 2.4), send a test message and check it arrives by email **and** in the Supabase `messages` table.
- [ ] Supabase: pg_cron deletion of old messages is active (SUPABASE_SETUP.md step 7), sign-ups are disabled, Daniel can log in.
- [ ] Admin panel (`/admin`): Supabase Auth URL configuration + SMTP done (SUPABASE_SETUP.md step 8); log in on a phone, upload a photo, change an opening hour, use "Passwort vergessen?"; send Daniel ADMIN_GUIDE.md. Check that `https://toshallroundservices.de/admin` answers with the header `X-Robots-Tag: noindex` and is not in the sitemap.
- [ ] Replace remaining stock photos (marked in `src/data/` and `public/images/CREDITS.md`).
- [ ] Add the site to **Google Search Console** (https://search.google.com/search-console, "Domain" property) and submit `https://toshallroundservices.de/sitemap.xml`.
- [ ] Optional: add opening hours to the LocalBusiness data in `index.html` once they are final.
