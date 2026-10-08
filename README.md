# Beauty of Bharat — thebeautyofbharat.com

A free digital newspaper of uplifting stories about India from ground zero. One Next.js app
serves the public site and the CMS (Payload) at `/admin`.

- **Editors:** see [EDITOR_GUIDE.md](EDITOR_GUIDE.md).
- **Deploying:** see [DEPLOY.md](DEPLOY.md).
- **Original brief and designs:** [`kit/CLAUDE_CODE_PROMPT.md`](kit/CLAUDE_CODE_PROMPT.md), [`design-reference/`](design-reference), [`brand/`](brand). Build plan: [PLAN.md](PLAN.md).

## Stack

Next.js 16 (App Router, React Server Components, TypeScript strict) · Payload CMS 3 · PostgreSQL ·
Tailwind CSS 4 · Lexical rich text · Cloudflare R2 (S3) for media in production · Resend for email ·
Cloudflare Turnstile · Vitest + Playwright + axe.

## Run it locally

Requirements: **Node.js 20+** (24 tested), **pnpm** via corepack, and **Docker** (for Postgres).

```bash
corepack enable                 # once, provides pnpm (or prefix commands with `corepack`)
pnpm install
cp .env.example .env            # then edit PAYLOAD_SECRET, PREVIEW_SECRET, CRON_SECRET, SEED_ADMIN_PASSWORD
pnpm db:up                      # starts Postgres in Docker on 127.0.0.1:5432
pnpm seed                       # creates the admin user + sample content
pnpm dev                        # http://localhost:3000 and http://localhost:3000/admin
```

Log in to `/admin` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`.
Without `pnpm seed`, the first visit to `/admin` asks you to create the first account, which is always an admin.

In development the database schema is updated automatically from the code. Production uses the
committed migrations in `src/migrations` (run automatically on start-up and during `pnpm build`).

## Commands

| Command                                        | What it does                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`                                     | Dev server with hot reload                                                                                         |
| `pnpm build` / `pnpm start`                    | Production build / server (the build needs the database)                                                           |
| `pnpm seed`                                    | Admin user + sample content. Safe to re-run: it replaces the sample content                                        |
| `pnpm seed:clear`                              | Deletes all sample stories, people and images (everything marked `isSample`)                                       |
| `pnpm migrate:create <name>`                   | After changing collections: generate a migration and commit it                                                     |
| `pnpm migrate`                                 | Apply migrations (production does this on boot)                                                                    |
| `pnpm generate:types`                          | Regenerate `src/payload-types.ts` after changing collections                                                       |
| `pnpm generate:importmap`                      | Regenerate the admin import map after adding admin components                                                      |
| `pnpm lint` · `pnpm typecheck` · `pnpm format` | ESLint · `tsc --noEmit` · Prettier                                                                                 |
| `pnpm test:unit`                               | Vitest unit tests                                                                                                  |
| `pnpm test:e2e`                                | Playwright tests, desktop + mobile, with axe checks (needs a seeded site; starts `pnpm dev` if nothing is running) |
| `pnpm lighthouse`                              | Lighthouse, median of 3 runs, on Home / Article / People (`BASE_URL=…`, `CHROME_PATH=…`)                           |
| `pnpm lhci`                                    | Lighthouse CI with the budgets in `lighthouserc.json`                                                              |
| `pnpm icons`                                   | Regenerate favicon / app icons from `brand/mark-color.svg`                                                         |
| `node scripts/screenshots.mjs <dir> [paths…]`  | Full-page screenshots at 1440px and 390px (flags horizontal overflow)                                              |
| `pnpm payload run scripts/verify-schedule.ts`  | End-to-end check of scheduled publishing                                                                           |

## Environment variables

See [`.env.example`](.env.example) for every variable with comments. Required in production:
`DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `PREVIEW_SECRET`, `CRON_SECRET`.
Recommended: `S3_*` (media on R2), `RESEND_API_KEY` + `CONTACT_FROM_EMAIL` (contact form and password-reset emails),
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` (spam protection). Unset optional services fall back safely:
media goes to local disk, emails are written to the server log, and Turnstile is skipped.

## Architecture

```
src/
  app/(frontend)/   public site: pages, server actions, draft-preview routes, OG image routes
  app/(payload)/    Payload admin + REST API (generated; don't edit)
  app/              sitemap.ts, robots.ts, manifest.ts, rss.xml, news-sitemap.xml, icons
  collections/      Articles, People, Categories, Locations, Media, Pages, ContactSubmissions, ArticleViews, Users
  globals/          SiteSettings, Navigation
  access/           role rules: admin / editor / reporter / public
  blocks/           Lexical blocks (image, pull quote, video) and About-page blocks
  components/       design-system components (header, cards, article parts, people, contact form…)
  lib/              data queries and pure helpers (dates, read time, slugs, filters, video allowlist, copy.ts)
  seed/             pnpm seed / seed:clear
  migrations/       committed Postgres migrations
tests/unit · tests/e2e
```

- **Rendering:** Home, About, legal pages, every article and every profile are statically generated. Payload
  `afterChange` hooks revalidate the affected pages the moment an editor publishes, unpublishes or edits, with a
  5-minute background refresh as a safety net. `/news`, category pages, `/people` (filters) and `/search` render
  per request.
- **Access:** reporters create and edit only their own drafts and can never publish (enforced in access rules
  and a `beforeChange` hook). The public API returns only published content, and only people who are published,
  hold an active press card and are shown on the People page.
- **Scheduling:** Payload's "Schedule publish" queues a job. A long-running server runs due jobs every minute; on
  Vercel a cron calls `/api/payload-jobs/run` every 5 minutes (`vercel.json`, authorised with `CRON_SECRET`).
- **Redirects:** changing a published story's slug creates a permanent redirect from the old address.
  Editors can add more under Settings → Redirects.
- **UI strings** live in `src/lib/copy.ts`, ready for a Hindi or Punjabi edition.
- **Security:** CSP and security headers in `next.config.ts`; rich text is rendered as React (no raw HTML);
  video embeds are allowlisted (YouTube via youtube-nocookie, Vimeo, Instagram) and load only on click;
  the contact form has a honeypot, Turnstile and a 5-per-hour limit per (hashed) IP; admin logins lock after 5 failures.

## Quality checks (latest run)

- `pnpm typecheck` and `pnpm lint`: clean. Unit tests: 38 passing. E2E: 23 passing (desktop + mobile), with zero
  serious/critical axe issues on every template.
- Lighthouse 12, mobile profile, median of 3, against a local production build (`next start`, gzip, no CDN):

  | Page    | Performance | Accessibility | Best practices | SEO | LCP   | CLS   |
  | ------- | ----------- | ------------- | -------------- | --- | ----- | ----- |
  | Home    | 96          | 100           | 100            | 100 | 2.7 s | 0.001 |
  | Article | 92          | 100           | 100            | 100 | 3.3 s | 0     |
  | People  | 94          | 100           | 100            | 100 | 3.0 s | 0     |

  Lighthouse measured the real (unthrottled) LCP at about 0.2 s. The simulated 4G figure is dominated by the
  web-font and framework downloads. Re-check on the deployed site with PageSpeed Insights, where Brotli and the CDN
  apply (see DEPLOY.md). The Article page is still under the 95 target.

## Visual check against the designs

`node scripts/screenshots.mjs <dir>` captures every page at 1440px and 390px. Each was compared side by side
with its `design-reference/` file; the pages match the approved layouts, type scale, colours and spacing.

### Deviations from design

- **Photo-credit colour** (`faint`) is `#6E6E78` instead of `#8A8A94`: the original fails WCAG AA contrast at caption size.
- **Newsreader is loaded without the optical-size axis** (weights 400/500/600), and italics come from a separate,
  lazily loaded file. Loading the opsz axis was 145 KB and cost about 6 Lighthouse points; at these sizes the visual
  difference is slight. To restore it, put `axes: ['opsz']` back in `src/app/(frontend)/layout.tsx` (and remove `weight`).
- **Header variants:** Home, News and category pages use the full masthead (utility bar + category bar), as in
  Home.html. Story, People, About and Contact pages use the compact header shown in their design files.
- **Footer:** the full footer (Sections / Follow / Legal columns, tricolour, © line) appears on every page. Some
  designs showed a one-row footer; the brief describes the full one.
- **Home secondary stories** (the two headlines beside the lead) also show on phones, so those stories aren't
  hidden from mobile readers.
- **Header search** links to `/search` (the brief allows a link or an overlay).
- **Permanent redirects** use HTTP 308 (Next.js `permanentRedirect`), which search engines treat like 301.
- **Article tag chips** include the location, which links to a search for that place (there is no location archive page).

## Before launch: placeholders to replace

| What                                  | Where                                | Placeholder                                                                                                                                          |
| ------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| All sample stories, people and images | run `pnpm seed:clear`                | 13 stories, 8 people (names, roles, card numbers BOB/001–015, `firstname@thebeautyofbharat.com` emails), 15 plain-colour images, a sample video link |
| Desk emails                           | Admin → Site settings → Contact      | `tips@`, `press@`, `hello@`, `corrections@thebeautyofbharat.com`. Make sure these mailboxes exist                                                    |
| WhatsApp number                       | Site settings → Contact              | `[WhatsApp number]`                                                                                                                                  |
| WhatsApp channel link                 | Site settings → Contact              | empty                                                                                                                                                |
| Social links                          | Site settings → General              | point at instagram.com, youtube.com, whatsapp.com/channel, x.com home pages                                                                          |
| Privacy Policy and Terms of Use       | Admin → Pages                        | short placeholder text, marked PLACEHOLDER. Needs legal review                                                                                       |
| Default sharing image                 | Site settings → General              | not set (generated images are used instead)                                                                                                          |
| "Most read" picks and people band     | Site settings → Homepage             | reset when sample content is cleared; choose real ones                                                                                               |
| Admin password                        | `SEED_ADMIN_PASSWORD` / your account | change after first login                                                                                                                             |

Categories, locations and the About page are real configuration, not sample content: `seed:clear` keeps them.
