# Deploying thebeautyofbharat.com

Two supported setups:

- **A. Vercel (site + photo storage) + Neon (Postgres) + Resend (email):** recommended, mostly free tiers.
- **B. Any Linux VPS with Docker:** everything on one server.

Both need the same environment variables (see [`.env.example`](.env.example)). Generate secrets with
`openssl rand -hex 32` (or any long random string).

---

## A. Vercel + Neon

### 1. Database: Neon

1. Create a project at neon.tech, in an India or Singapore region (closest to readers).
2. Copy the **pooled** connection string (`postgres://…-pooler…/neondb?sslmode=require`). That is `DATABASE_URI`.
3. Backups: Neon keeps point-in-time history (7 days on the free plan, longer on paid plans). To restore,
   use Neon → Branches → Restore. Also take a weekly `pg_dump` and keep it off-site (see "Backups" below).

### 2. Images: Vercel Blob

Done inside Vercel after the project exists (step 5): Project → **Storage** → **Create Database / Store** →
**Blob** → connect it to the project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically; redeploy once afterwards.
Photos uploaded in the admin then go straight to Blob's CDN. Without a Blob store, uploads on Vercel would be lost.

### 3. Email: Resend

1. resend.com → **Domains → Add domain** → `thebeautyofbharat.com`.
2. Add the DNS records Resend shows (SPF `TXT`, DKIM `CNAME`/`TXT`, optional DMARC) at your DNS provider and wait for
   "Verified".
3. Create an API key (`RESEND_API_KEY`). Set `CONTACT_FROM_EMAIL="Beauty of Bharat <noreply@thebeautyofbharat.com>"`.
4. Make sure the four desk addresses in Site settings (tips@, press@, hello@, corrections@) are real mailboxes or
   forwards. Resend only _sends_; receiving mail needs Google Workspace, Zoho, or Cloudflare Email Routing (free forwarding).

### 4. Spam protection: Cloudflare Turnstile

Cloudflare → Turnstile → **Add site** → domain `thebeautyofbharat.com`, widget mode _Managed_. Copy the site key
(`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) and secret key (`TURNSTILE_SECRET_KEY`).

### 5. Vercel project

1. Push this repository to GitHub, then on vercel.com → **Add New Project** → import it. Framework: Next.js.
   Vercel detects pnpm from `pnpm-lock.yaml`.
2. **Environment variables** (Production and Preview):

   | Name                                                                                                 | Value                                                                |
   | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
   | `DATABASE_URI`                                                                                       | Neon pooled connection string                                        |
   | `PAYLOAD_SECRET`                                                                                     | long random string                                                   |
   | `NEXT_PUBLIC_SITE_URL`                                                                               | `https://thebeautyofbharat.com`                                      |
   | `PREVIEW_SECRET`                                                                                     | long random string                                                   |
   | `CRON_SECRET`                                                                                        | long random string (Vercel sends it to the cron route automatically) |
   | `BLOB_READ_WRITE_TOKEN` | added automatically when you connect a Blob store (step 2) |
   | `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`                                                               | from step 3                                                          |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`                                             | from step 4                                                          |

3. Deploy. The build connects to Neon, **runs the migrations** in `src/migrations`, and pre-renders the pages.
4. **First admin:** open `https://<your-deployment>/admin`. The first account you create becomes an admin.
   (Alternatively run `pnpm seed` locally with `DATABASE_URI` pointing at Neon, but that also loads sample content.)

### 6. Scheduled publishing (cron)

`vercel.json` asks Vercel Cron to call `/api/payload-jobs/run?queue=default` **once a day** (00:30 UTC), the most often Vercel's free Hobby plan allows. On **Pro**, change the schedule in `vercel.json` to `*/5 * * * *`. `vercel.json` also pins the site to Vercel's Singapore region (`sin1`), next to the Neon database. Vercel adds the
`Authorization: Bearer $CRON_SECRET` header, which the endpoint checks.

- Vercel **Pro** runs it as configured.
- On the **Hobby** plan, crons may only run once a day. Use a free external scheduler instead (e.g. cron-job.org,
  or a GitHub Actions workflow on `*/5 * * * *`) that sends
  `GET https://thebeautyofbharat.com/api/payload-jobs/run?queue=default` with the header
  `Authorization: Bearer <CRON_SECRET>`.

### 7. Domain and DNS

1. Vercel → Project → **Settings → Domains** → add `thebeautyofbharat.com` and `www.thebeautyofbharat.com`
   (set `www` to redirect to the apex, or the other way round, and match `NEXT_PUBLIC_SITE_URL`).
2. At your registrar / DNS provider:
   - apex `thebeautyofbharat.com` → `A 76.76.21.21` (or the record Vercel shows)
   - `www` → `CNAME cname.vercel-dns.com`
   - Resend's SPF/DKIM records (step 3)
3. Vercel issues HTTPS certificates automatically. HSTS is sent once `NEXT_PUBLIC_SITE_URL` starts with `https://`.

### 8. After the first deploy

- Log in, then **Settings → Site settings**: replace the placeholder emails, WhatsApp number and social links.
- Run `pnpm seed:clear` against production if you loaded sample content, then add real people and stories.
- Submit `https://thebeautyofbharat.com/sitemap.xml` and `/news-sitemap.xml` in Google Search Console
  (and apply to Google News Publisher Center if desired).
- **Check structured data:** open https://search.google.com/test/rich-results, paste an article URL, and confirm
  _Article_ (NewsArticle) and _Breadcrumb_ are detected without errors. Do the same for a profile (ProfilePage)
  and the homepage (Organization / WebSite with search box).
- **Check performance:** run https://pagespeed.web.dev on the homepage, an article and /people (mobile).

---

## B. Docker on a VPS

Tested shape: Ubuntu 24.04, 2 GB RAM, Docker Engine + Compose plugin. Postgres and the app run in containers; a
reverse proxy (Caddy shown) terminates HTTPS.

```bash
git clone <repo> /srv/beautyofbharat && cd /srv/beautyofbharat
cp .env.example .env
# Edit .env: secrets, NEXT_PUBLIC_SITE_URL=https://thebeautyofbharat.com,
# a strong POSTGRES_PASSWORD (also inside DATABASE_URI, host 127.0.0.1), optional Resend/Turnstile.
docker compose up -d postgres
docker compose --profile app build      # builds with host networking so it can reach Postgres; runs migrations
docker compose --profile app up -d app  # serves on 127.0.0.1:3000
```

- Uploaded images are stored in the `media` Docker volume.
- **Scheduled publishing** runs inside the app every minute (no cron needed on a long-running server).
- **Reverse proxy** (Caddy, automatic HTTPS), `/etc/caddy/Caddyfile`:

  ```
  thebeautyofbharat.com, www.thebeautyofbharat.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
  }
  ```

  Point the domain's `A` record (and `www`) at the server's IP.

- **Updating:** `git pull && docker compose --profile app build && docker compose --profile app up -d app`.
- **First admin:** visit `/admin` and create the first account, or run `pnpm seed` from a checkout with the same `.env`.

---

## Backups

- **Database:** Neon point-in-time restore (A) or the Docker volume (B). In both cases also keep a nightly logical
  dump off-site, e.g.

  ```bash
  pg_dump "$DATABASE_URI" --format=custom --file=bob-$(date +%F).dump
  ```

  and restore with `pg_restore --clean --no-owner -d "$DATABASE_URI" bob-YYYY-MM-DD.dump`.

- **Images:** download the Blob store's files periodically (A); back up the `media`
  volume (B).
- Test a restore at least once before launch.

## Changing the data model later

1. Edit the collection in `src/collections`.
2. `pnpm generate:types` and `pnpm migrate:create <short-name>`, then review and commit the migration.
3. Deploy. Migrations run automatically during the build and on start-up.
