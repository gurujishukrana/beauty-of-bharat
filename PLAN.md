# Build plan — Beauty of Bharat (thebeautyofbharat.com)

This is the working plan for the build. The brief is in `CLAUDE_CODE_PROMPT.md`; the approved screens
are in `design-reference/`; logos are in `brand/`.

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.3 (App Router, RSC, TypeScript strict) | Pinned to the version Payload 3.90's official templates test against. |
| CMS | Payload 3.90 inside the same Next app, admin at `/admin` | |
| Database | PostgreSQL via `@payloadcms/db-postgres` | Docker Compose locally, Neon/Supabase in production. Migrations committed and run on boot (`prodMigrations`). |
| Media | `@payloadcms/storage-s3` (Cloudflare R2) when `S3_BUCKET` is set, local disk otherwise | |
| Rich text | Lexical, rendered with Payload's JSX converters (no raw HTML) | |
| Styling | Tailwind CSS v4, tokens in `@theme` | No UI kit. |
| Fonts | `next/font/google`: Newsreader (variable, opsz, normal + italic) and Libre Franklin (variable) | Variable files cover the listed weights in one file per style. |
| Email | Resend over its HTTP API (no SDK); logs to the console when `RESEND_API_KEY` is unset | |
| Spam | Honeypot + Cloudflare Turnstile + rate limit (5/hour per hashed IP, counted in the DB so it works on serverless) | |
| Tests | Vitest (unit), Playwright + axe (E2E, desktop + mobile), Lighthouse CI config | |
| Package manager | pnpm 10 (via corepack) | |

### Deliberate deviations from the brief

- **TypeScript 5.7, not 7.** TypeScript 7 (native compiler) is out, but Payload's templates still pin 5.7, and Next's type plugin targets 5.x.
- **Permanent redirects are 308, not 301.** Next's `permanentRedirect()` sends 308, which search engines treat the same as 301.
- **Header search is a link to `/search`** (the brief allows either an overlay or a direct link). No extra client JS.

## Folder structure

```
src/
  app/
    (frontend)/            public site (own root layout)
      page.tsx             home
      news/ news/[slug]/   list + article (+ opengraph-image)
      category/[slug]/
      people/ people/[slug]/ (+ opengraph-image)
      about/ contact/ search/ privacy/ terms/
      next/preview, next/exit-preview   draft mode
      rss.xml, news-sitemap.xml          route handlers
      sitemap.ts, robots.ts, manifest.ts
      not-found.tsx, error.tsx
    (payload)/             generated admin + REST/GraphQL routes
  collections/             Users, Articles, Categories, Locations, People, Media, Pages, ContactSubmissions, ArticleViews
  globals/                 SiteSettings, Navigation
  blocks/                  Lexical blocks (Image, PullQuote, VideoEmbed) + About page blocks
  access/                  role helpers (admin / editor / reporter / public)
  hooks/                   revalidation, slug redirects, read time
  lib/                     pure helpers (readTime, slugify, dates, people filters, video URLs, queries, copy.ts)
  components/              design-system components (TricolourRule, SiteHeader, MobileNav, cards, …)
  admin/                   admin branding + "Submit for review" button
  seed/                    pnpm seed / pnpm seed:clear
tests/unit, tests/e2e
```

## Data model

As specified in section 4 of the brief, plus:

- `articles.plainText` (hidden): body text extracted on save, used for read time and search.
- `articles.reviewStatus`: `in-progress` | `ready`, set by the "Submit for review" button.
- `articles.updatedNote`: tick to show "Updated [date]".
- `isSample` checkbox on every seeded collection, so `pnpm seed:clear` removes only sample content.
- `contactSubmissions.ipHash` (hidden): salted SHA-256 of the sender IP, used only for rate limiting.
- `articleViews` (optional, off by default): one row per article per day, counted server-side, no cookies.
- `redirects` (from `@payloadcms/plugin-redirects`): rows are created automatically when a published article's slug changes.

Access control: admins can do everything. Editors manage all content and can read submissions. Reporters can create and update only drafts where they are an author, and cannot publish (enforced in access *and* in a `beforeChange` hook). The public API reads only published articles, pages and categories, and only people who are published, active and shown on the People page.

## Rendering and caching

- Pages are statically generated and revalidated on demand from Payload `afterChange`/`afterDelete` hooks with `revalidatePath`.
- `/news`, `/category/*`, `/people` and `/search` read search params (pagination, filters), so they render per request. The queries are small.
- Draft mode (`/next/preview`) plus Payload Live Preview for articles and people.
- Scheduled publishing uses Payload's `schedulePublish` and the jobs queue. On a Node server, `jobs.autoRun` runs every minute. On Vercel, a cron hits `/api/payload-jobs/run` every 5 minutes with `CRON_SECRET`.

## Phases

1. **Foundation**: Next + Payload + Postgres (Docker) + Tailwind tokens + fonts + favicons; layout shell (`SiteHeader`, `MobileNav`, `SiteFooter`, `TricolourRule`) and the 404 page.
2. **Data model and CMS**: collections, globals, access, drafts/versions, scheduling, image sizes, S3, live preview, revalidation, admin branding, seed scripts.
3. **Public pages**: Home, News, Category, Article, People, Profile, About, Contact (form, email, spam protection), Search, Privacy/Terms.
4. **SEO, performance, accessibility**: metadata, OG images, JSON-LD, sitemaps, RSS, redirects, video facades, a11y fixes.
5. **Tests, docs, deploy**: Vitest, Playwright + axe, `README.md`, `EDITOR_GUIDE.md`, `DEPLOY.md`.
