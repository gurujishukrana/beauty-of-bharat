# Build prompt: Beauty of Bharat — thebeautyofbharat.com

> Paste everything below this line into Claude Code, run from the root of this folder (the one that contains `brand/` and `design-reference/`).

---

You are building the production website for **Beauty of Bharat**, a **free digital newspaper focused on uplifting stories about India from ground zero**. Domain: **thebeautyofbharat.com**.

The UI has already been designed and approved. Your job is to turn that design into a fast, credible, fully working website with a proper CMS, so the editorial team can publish articles and manage the team directory without a developer.

Read this whole prompt before writing any code. Then work through the **phases at the end**, in order, checking each phase's acceptance criteria before moving on.

---

## 0. How to work

1. **Plan first.** Before coding, read every file in `design-reference/` and `brand/`, then write a short plan (`PLAN.md`) listing the stack, folder structure, data model and phases. Then start building without waiting for approval, unless something in this prompt is contradictory.
2. **The design is the source of truth for the look.** The files in `design-reference/` are the approved screens. Match their layout, spacing, type sizes, colours and copy tone closely. They were made in a design tool, so:
   - Inline `style="…"` values are the exact intended styles. Convert them into the design tokens and components described below. Don't copy inline styles into production code.
   - `{{something}}`, `<sc-for>`, `<sc-if>`, `<x-dc>`, `<helmet>` and the `<script type="text/x-dc">` blocks are design-tool templating. The data inside `renderVals()` is **sample content** that shows what each list holds. It is not real content.
   - Links between screens point to `Home.html`, `Article.html` and so on. Map them to the real routes in section 3.
3. **Don't invent real-world facts.** All names, headlines, card numbers, emails and the WhatsApp number in the designs are placeholders. Seed them as clearly-marked sample content (section 12) that the team can delete in one step.
4. **Commit in small, logical steps** with clear messages. Keep a `README.md` up to date as you go.
5. **Verify your own work.** After each phase, run the app, open every page you touched at desktop (1440px) and phone (390px) widths, and fix what's broken before continuing. Run lint, type-check and tests.
6. **Keep it simple.** This is not a giant news portal. Avoid unnecessary dependencies, client-side JavaScript and abstractions.

---

## 1. Tech stack

Use this stack unless there's a strong technical reason not to. If you deviate, explain why in `PLAN.md`.

| Concern | Choice |
|---|---|
| Framework | **Next.js** (latest stable, App Router, React Server Components, TypeScript strict) |
| CMS | **Payload CMS 3.x**, installed *inside* the same Next.js app (admin at `/admin`) |
| Database | **PostgreSQL** (`@payloadcms/db-postgres`), e.g. Neon or Supabase in production, Docker locally |
| Media storage | S3-compatible storage (`@payloadcms/storage-s3`), e.g. Cloudflare R2. Local disk in development |
| Rich text | Payload **Lexical** editor |
| Styling | **Tailwind CSS** with the design tokens below set in the theme. No UI kit |
| Fonts | `next/font/google`: **Newsreader** (serif) and **Libre Franklin** (sans), self-hosted by Next |
| Images | `next/image` with Payload image sizes; AVIF/WebP |
| Email (contact form) | **Resend** (or SMTP via Nodemailer). Must be configurable through env vars |
| Spam protection | Honeypot field + **Cloudflare Turnstile** + simple rate limiting |
| Hosting | **Vercel** (or any Node host / VPS with Docker). Write instructions for both |
| Package manager | pnpm |

---

## 2. Brand and design system

### 2.1 Logo files (in `brand/`)
- `logo-color.svg`: full horizontal lockup (mark + "BEAUTY OF BHARAT"). Use in the site header.
- `logo-white.svg`: white version. Use in the dark footer.
- `logo-black.svg`: single-colour black version.
- `mark-color.svg`, `mark-white.svg`, `mark-black.svg`: the "B" mark on its own. Use for the favicon, app icons, the About page and the press-card badge.

Generate `favicon.ico`, `icon.svg`, `apple-icon.png` (180×180) and a web manifest from `mark-color.svg`. The mark sits on white with padding for raster icons. Never stretch, recolour (except the provided white/black versions) or add effects to the logo. Header logo height: **34px desktop, 22px mobile**. Footer: **28–30px**.

### 2.2 Colour tokens
Use these exact values. The three logo colours are **accents**, used sparingly (thin tricolour rules, the tip button, numerals). The site itself is black type on white.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#16161D` | Primary text, headings, primary buttons, 2px section rules |
| `ink-2` | `#23232B` | Article body text |
| `body` | `#3A3A44` | Decks, intros, secondary paragraphs |
| `muted` | `#4A4A55` | Card excerpts, bios |
| `subtle` | `#5B5B66` | Meta text (dates, read time, captions) |
| `faint` | `#8A8A94` | Photo credits inside captions |
| `rule` | `#E6E3DC` | 1px dividers, card borders, chips |
| `field` | `#CFCBC2` | Form input borders (`#D9D6CE` for chips/search) |
| `paper` | `#FFFFFF` | Page background |
| `sand` | `#F5F3EE` | Soft section backgrounds (people band, author box, "How we work") |
| `placeholder` | `#E7E1D5` | Image placeholder / loading background |
| `saffron` | `#F1923F` | Brand accent: tricolour rule, "Send us a tip" button (with `ink` text) |
| `saffron-text` | `#C9701F` | Saffron numerals ("Most read" numbers). Only at large sizes |
| `navy` | `#232357` | Brand accent: tricolour rule, news-tip band background |
| `green` | `#108547` | Brand accent: tricolour rule, active nav link + underline |
| `green-text` | `#0E7A41` | Category labels, text links, "View all →" links (passes AA on white) |
| `footer` | `#121218` | Footer background; footer text `#C9C9D2`, footer small text `#9A9AA6` |

**Tricolour rule**: a recurring brand detail made of three equal flex segments (saffron / navy / green).
- 4px full-width strip at the very top of every page, above the header.
- 3px × 72px above article pull-quotes.
- 3px × 120px in the footer (saffron / white / green on the dark background).

### 2.3 Typography
- **Serif, Newsreader** (weights 400, 500, 600; italic 400; optical sizing on): all headlines, section titles, decks, article body, pull quotes, "Most read" numerals, avatar initials.
- **Sans, Libre Franklin** (400, 500, 600, 700): navigation, labels, meta, buttons, forms, cards' excerpts, UI.

Type scale (desktop → mobile):

| Style | Font | Size / line-height | Weight | Notes |
|---|---|---|---|---|
| Article H1 | Serif | 56/1.05 → 33/1.08 | 500 | letter-spacing −0.015em |
| Page H1 (People, Contact, About) | Serif | 60–64/1.04 → 36 | 500 | −0.015em |
| Featured story headline | Serif | 44/1.08 → 31/1.1 | 500 | −0.01em |
| Section title ("Latest news") | Serif | 32 → 26 | 500 | sits under a 2px `ink` top rule |
| Card headline | Serif | 23/1.2 (compact list 18–22) | 500 | |
| Deck / standfirst | Serif | 23/1.4 article, 17/1.55 sans on home hero | 400 | |
| Article body | Serif | 21/1.65 → 19/1.65 | 400 | max width ~700px (≈ 66ch) |
| Article H2 | Serif | 30/1.2 → 25 | 500 | |
| Pull quote | Serif italic | 32/1.3 → 25 | 400 | |
| Category label (kicker) | Sans | 11–12, uppercase, letter-spacing 0.08em | 700 | colour `green-text` |
| Meta | Sans | 13 | 400; author name 600 in `ink` | e.g. "By Harleen Kaur · 8 October 2026 · 6 min read" |
| Nav | Sans | 15 | 600 | |
| Button | Sans | 15 | 600–700 | |

Article drop cap: the first letter of the first paragraph, serif, ~74px, floated left, weight 500.

### 2.4 Layout and spacing
- Content container: `max-width: 1280px`, horizontal padding **40px desktop / 16px mobile** (`clamp(16px, 4vw, 40px)`).
- Article reading column: `max-width: 700px`. Article header column: `860px`. Inline figures may break out to `940px`. The hero image runs the full 1280 container.
- Section rhythm: 56–88px vertical padding on desktop, 28–32px on mobile.
- Grids: card grids use `repeat(auto-fill, minmax(300px, 1fr))` with `gap: 44px 32px`. The people grid uses `minmax(270px, 1fr)`. Everything collapses to one column on phones.
- Corners: **2px radius** on images, buttons and inputs (almost square = editorial). Pills/chips and icon buttons are fully rounded.
- No shadows, no gradients, no glassmorphism, no emoji, no decorative animation. Hover = colour change to green (links) only. Focus states must be clearly visible (2px `green` outline with offset).

### 2.5 Components to build (match `design-reference/`)
- `TricolourRule` (variants: top strip, short, footer)
- `SiteHeader`: tricolour strip → (desktop only) utility bar with today's date (Asia/Kolkata, format "Thursday, 8 October 2026"), "A free newspaper. No paywall, ever." and social icons → main bar with logo left, nav right (Home · News · People · About · Contact + round 44px search button) → category bar (horizontally scrollable list of categories, 13px/500). The active nav item is `green` with a 2px green underline.
- `MobileNav`: on screens under ~760px the header shows logo + search + hamburger. The hamburger opens a full-screen white menu (see `design-reference/MobileArticle.html`, open state): tricolour strip, logo + close button, nav items in serif 30px with dividers, a "Topics" chip list, and a saffron "Send us a news tip" button. Must trap focus, close on Esc, lock body scroll, and restore focus to the button.
- `CategoryLabel`, `Byline` / `Meta`, `ReadTime`
- `ArticleCardLarge` (featured), `ArticleCard` (grid: 16:10 image, kicker "CATEGORY · PLACE", headline, excerpt, author · date), `ArticleListItem` (thumbnail left 168×126, text right), `ArticleCompactItem` (mobile: text left, 96px square thumb right), `MostReadList` (numbered 1–5)
- `SectionHeader` (2px ink top rule, serif title, optional "View all →" link)
- `PersonCard` (4:5 portrait, press-card line with shield-check icon "Press card · BOB/004", name, role, location with pin icon, bio, "View profile →" + social icons)
- `PressCardPanel` (profile sidebar: mark, "Official press card / Issued by Beauty of Bharat", card number, status, joined, based in)
- `AuthorBox` (sand background, avatar, "About the reporter", name, role · location · "Press card holder", bio, "More stories by …")
- `ShareButtons` (WhatsApp, X, Facebook, Copy link; 44px round outline icon buttons; native `navigator.share` on mobile when available)
- `PullQuote`, `Figure` (image + caption + credit), `VideoEmbed` (click-to-load, see Performance)
- `NewsTipBand` (navy background, white serif heading "Know a story that deserves to be seen?", saffron button)
- `PeopleBand` (sand background, "Every story has a reporter you can see", avatar row)
- `Pagination` / `LoadMoreButton` (outlined ink button, 1.5px border)
- `SiteFooter` (dark): white logo, tagline, columns Sections / Follow / Legal, short tricolour rule, © line + domain
- `ImagePlaceholder`: the `placeholder` colour block, used when an article has no image yet
- Icons: simple inline stroke SVGs (1.8–2px stroke) as in the designs, or `lucide-react`. No icon fonts.

---

## 3. Routes and information architecture

| Route | Page |
|---|---|
| `/` | Home |
| `/news` | All news, newest first, paginated (`/news?page=2`) |
| `/news/[slug]` | Article |
| `/category/[slug]` | Category archive, paginated |
| `/people` | People directory: "The People Behind Beauty of Bharat" |
| `/people/[slug]` | Person profile + "Articles by [Name]" |
| `/about` | About |
| `/contact` | Contact |
| `/search?q=` | Search results (articles + people) |
| `/privacy`, `/terms` | Legal pages (editable in CMS) |
| `/admin` | Payload CMS admin |
| `/rss.xml`, `/sitemap.xml`, `/news-sitemap.xml`, `/robots.txt` | Feeds / SEO |

Main navigation (exactly): **Home | News | People | About | Contact**.

Custom **404** and **500** pages styled in the same system, with a search box and links to Home and Latest news.

---

## 4. Data model (Payload collections and globals)

### Collections

**`users`** (CMS logins, auth enabled)
- `name`, `email`, `role`: `admin` | `editor` | `reporter`
- optional `person` (relationship → `people`), linking a login to a public profile

**`articles`** (drafts + versions enabled, autosave, **scheduled publishing** enabled)
- `title` (required)
- `slug` (unique, auto-generated from title, editable, used in `/news/[slug]`)
- `deck` (subheadline / standfirst, textarea, required)
- `excerpt` (short card text, ≤ 200 chars; falls back to `deck`)
- `heroImage` (upload → `media`, required to publish) with `heroCaption`, `heroCredit`
- `body` (Lexical rich text). Must support: paragraphs, H2/H3, bold/italic, links (internal + external), bulleted/numbered lists, **Image block** (image, caption, credit, size: column / wide), **Pull quote block** (quote, attribution), **Video embed block** (YouTube / Vimeo / Instagram URL, optional caption)
- `authors` (relationship → `people`, hasMany, at least 1; first is primary byline)
- `primaryCategory` (relationship → `categories`, required) and `categories` (hasMany, optional extras)
- `location` (relationship → `locations`)
- `publishedAt` (datetime, defaults to the publish time; used for sorting and display)
- `featured` (checkbox: "Feature on homepage"; the newest featured article becomes the hero, falling back to the newest article)
- `relatedArticles` (relationship → `articles`, hasMany, max 3; auto-fill with same-category articles if empty)
- `readTime` (auto-calculated from body word count, ~200 wpm, read-only)
- `seo` group: `metaTitle`, `metaDescription`, `ogImage` (fallback to hero), `canonicalUrl`, `noIndex`
- Virtual/admin: live preview + "View on site" button

**`categories`**
- `name`, `slug`, `description`, `order` (number, controls category bar order), `showInCategoryBar` (checkbox)
- Seed: People, Punjab, India, Education, Business, Culture, Innovation, Community, Environment, Achievements, Ground Reports. The list must stay fully editable.

**`locations`**
- `name` (e.g. "Ludhiana"), `state` (e.g. "Punjab"), `slug`. Display as "Ludhiana, Punjab".

**`people`** (drafts enabled; only **published + active** profiles appear publicly)
- `fullName`, `slug` (`/people/[slug]`)
- `photo` (upload → `media`; portrait 4:5 crop)
- `designation` (e.g. "Punjab Correspondent"), `roleType` (select: Editor, Reporter, Photographer, Contributor; used for directory filters)
- `location` (relationship → `locations`)
- `shortBio` (≤ 240 chars, used on cards) and `bio` (rich text, used on profile)
- `pressCardNumber` (unique, e.g. "BOB/004"), `pressCardStatus` (`active` | `suspended` | `revoked`), `dateJoined`
- `socialLinks` (array: platform select [Instagram, X, YouTube, LinkedIn, Facebook, Website, Email] + url)
- `showOnPeoplePage` (checkbox), `order` (number, for manual sorting; default sort = order, then name)
- Articles are linked automatically through `articles.authors` (use a Payload `join` field to show "Articles by this person" in the admin)

**`media`** (uploads)
- `alt` (required), `caption`, `credit`
- Image sizes: `thumb` 400w, `card` 800w, `feature` 1600w, `hero` 2400w, `portrait` 800×1000 (focal point enabled), `og` 1200×630

**`pages`** (for About, Privacy, Terms)
- `title`, `slug`, `body` (blocks or rich text), `seo` group. The About page is fully editable but must render the designed layout (see 5.6) via blocks: Statement hero, Two-column text, Numbered list ("What we cover"), Card grid ("How we work"), CTA row.

**`contactSubmissions`** (admin-only read, no public read)
- `name`, `contact` (email or phone), `topic` (News tip | Press enquiry | General enquiry | Correction), `message`, `articleUrl` (optional, for corrections), `createdAt`, `status` (new / in progress / done)

### Globals

**`siteSettings`**
- `tagline` ("A free newspaper telling uplifting stories about India from ground zero.")
- `utilityBarText` ("A free newspaper. No paywall, ever.")
- `contactEmails`: `tips`, `press`, `general`, `corrections` (each shown on the Contact page)
- `whatsappNumber` (shown on Contact; also builds `wa.me` links), `whatsappChannelUrl`
- `socialLinks` (array: platform + url) for header, footer and contact
- `defaultOgImage`, `organizationLogo`
- `homepage`: toggles + counts for each home section (latest count default 6, ground reports category, show people band, show tip band)

**`navigation`**: header + footer links (default to the IA in section 3), so the team can edit footer links without a developer.

### Access control
- **Admin**: everything, including users and settings.
- **Editor**: create, edit, publish, unpublish and schedule all articles; manage categories, locations, people and media; read contact submissions.
- **Reporter**: create and edit **their own draft articles** (where they are an author) and upload media; **cannot publish**. Clicking "Submit for review" sets a `reviewStatus` field to `ready` that editors can filter by.
- Public API: read only published articles/people/categories/pages. Hide drafts, `contactSubmissions` and users.

---

## 5. Page specifications

Match each page to its file in `design-reference/`. Everything is server-rendered. Use client components only for: mobile menu, share/copy button, load-more, video click-to-load, contact form and search input.

### 5.1 Home `/` (→ `Home.html`, `MobileHome.html`)
In order:
1. **Header** (with category bar).
2. **Mission line**: serif 22px, max ~760px wide: "A free newspaper telling *uplifting stories about India from ground zero* — the people, places and progress that deserve to be seen." (editable in `siteSettings`). Answers "What is Beauty of Bharat?" immediately.
3. **Featured story**: 2px ink top rule, then two columns: large 3:2 image (≈ 2/3 width) | text column with kicker (CATEGORY · LOCATION), serif 44px headline, deck, meta (By Author · date · read time), black **"Read story →"** button. Below that, in the same column, separated by rules, **two secondary stories** (kicker + serif 20px headline). Stacks to one column on mobile with a full-width button.
4. **Latest news**: section header with "View all news →" (`/news`). Grid of 6 `ArticleCard`s (newest first, excluding stories already shown above). **"Load more stories"** button appends the next 6 without a full reload; it degrades to a link to `/news?page=2` without JS. On mobile: first card full-size, then `ArticleCompactItem`s.
5. **Ground reports + Most read** (two columns, 2:1): left = 3 `ArticleListItem`s from the "Ground Reports" category; right = "Most read" numbered 1–5. For "Most read" use a simple privacy-friendly view counter (one row per article per day, server-side increment, no cookies) or let editors pin up to 5 articles in `siteSettings`. Build the editor-pinned option first, with the counter as an optional toggle.
6. **People band** (sand): "Who is behind it" kicker, "Every story has a reporter you can see", short paragraph, "Meet the team →" button, and a row of 5 round avatars with name + city linking to profiles.
7. **News tip band** (navy) → `/contact`.
8. **Footer**.

### 5.2 News `/news` and Category `/category/[slug]`
- Title (serif 48–56px), category description if any, category chips to switch.
- `ArticleCard` grid, 12 per page, numbered pagination (Previous / 1 2 3 … / Next) with proper `<link rel="prev/next">` and canonical URLs. Category pages show only that category (primary or extra).

### 5.3 Article `/news/[slug]` (→ `Article.html`, `MobileArticle.html`)
- Breadcrumb: News / Category.
- Header column (860px): serif 56px headline, serif deck 23px, then a bar between two 1px rules: author avatar + "By [Name]" (links to profile; multiple authors as "By A and B") + "date · location · N min read" on the left; share buttons on the right.
- **Hero image** full container width (~16:8), caption + credit underneath, centred to ~780px.
- **Body** in a 700px column: drop cap on the first paragraph, serif 21/1.65, H2s, links (green, underlined), image blocks (column or 940px wide) with caption + credit, pull quote with a short tricolour rule above, video block (16:9 click-to-load with a white round play button, "Video · duration" note).
- **Footer**: tag chips (categories + location, linking to archives), **AuthorBox**, "Spotted an error? Request a correction" link (→ `/contact?topic=correction&article=<url>`).
- **Related stories**: 3 cards plus "← Back to all news".
- Show "Updated [date]" next to the publish date if the article was meaningfully updated after publishing (an `updatedNote` checkbox the editor ticks).
- Mobile: hero image edge to edge, share becomes one native share button in the byline bar plus a 4-button share row after the body.

### 5.4 People `/people` (→ `People.html`)
- Kicker "Our team", H1 **"The People Behind Beauty of Bharat"**, intro: "Our reporters, editors and photographers work from the places they write about. Everyone listed here has been issued an official Beauty of Bharat press card."
- **Verify a press card** box (shield-check icon): "If someone says they represent Beauty of Bharat and they are not listed here, please let us know." (links to Contact).
- Filter chips (Everyone + each `roleType` + optionally top states) and a search field (name or location). Filtering works with URL params (`/people?role=reporter&q=pune`) so it works without JS and is shareable.
- Grid of `PersonCard`s. Only `showOnPeoplePage = true` **and** `pressCardStatus = active` **and** published.

### 5.5 Person profile `/people/[slug]` (→ `Profile.html`)
- Breadcrumb People / Name.
- Left column (≈380px): 4:5 portrait + **PressCardPanel** (card number, status "Active" in green, joined month/year, based in).
- Right column: designation kicker, serif 64px name, location with pin, serif 22px bio, social buttons (outlined, icon + label; "Email [first name]" if an email is set).
- **"Articles by [Full Name]"**: all published articles where this person is an author, newest first, `ArticleListItem` style, "Load more".
- If the press card is suspended/revoked or the profile is hidden, return 404 (don't leak data).

### 5.6 About `/about` (→ `About.html`)
- Statement hero: kicker "About Beauty of Bharat", serif 64px "A free newspaper focused on uplifting stories about India, from ground zero." with the large colour mark on the right.
- "Why we exist": two-column (title left, serif paragraphs right) between 1px rules.
- "What we cover": numbered 01–06 grid. Numerals cycle saffron-text / navy / green-text: People doing meaningful work · Communities creating change · Local stories, national attention · Indian achievements · Positive developments · Overlooked stories.
- "How we work" (sand background, white cards): Always free · From ground zero · Named and accountable · Open corrections.
- CTA row: "Read the stories. Meet the people who report them." + "Read the latest" (black) + "Meet the team" (outline).
- Tone: sincere and journalistic, not promotional. All copy editable in the CMS.

### 5.7 Contact `/contact` (→ `Contact.html`)
- H1 "Get in touch" + intro.
- Four desk columns between rules, each with a short coloured bar (saffron, navy, green, ink): **News tips**, **Press enquiries**, **General enquiries**, **Corrections**, each with a one-line description and its email from `siteSettings` (as `mailto:` links).
- **Form** (left, 2/3): Your name, Email or phone, "What is this about?" select (preselected via `?topic=`), Article link (shown only for Corrections, prefilled via `?article=`), Message, Send. Validation with inline errors, a success state ("Thanks — we've received your message"), honeypot + Turnstile + rate limit (e.g. 5/hour/IP). On submit: save to `contactSubmissions`, then email the matching desk address via Resend. Use a Next.js Server Action.
- **Sidebar**: WhatsApp card (sand; "The quickest way to send a tip, photos or a voice note." + number as a `wa.me` link) and "Follow Beauty of Bharat" social links.

### 5.8 Search `/search`
- Server-side Postgres search across article title, deck and body text, and people names/locations. Results in two groups (Stories, People) with highlighted query terms. The header search button opens a simple search overlay or goes straight to `/search`.

### 5.9 Legal
- `/privacy` and `/terms` from the `pages` collection, rendered in the 700px article column style.

---

## 6. CMS experience (for non-technical editors)

- Admin branding: Beauty of Bharat logo + mark as the admin logo/icon, brand colours in the admin theme.
- Article editor sidebar: status (Draft / Scheduled / Published), publish date/time (scheduling), authors, categories, location, featured toggle, related articles, SEO group with a live Google-style preview (title ≤ 60, description ≤ 160 character counters).
- **Live preview** of articles and people inside the admin (Payload Live Preview) plus a "Preview" link that opens a draft-mode URL on the site.
- **Scheduled publishing**: articles go live automatically at `publishedAt` (Payload scheduled publish / jobs queue; on Vercel use a cron hitting the jobs endpoint every 5 minutes).
- **Unpublish** returns an article to draft and removes it from all public lists, the sitemap and RSS.
- On publish/unpublish/update, **revalidate** the affected pages (home, /news, category pages, the article, author profiles, sitemap, RSS) with `revalidateTag`/`revalidatePath` in Payload `afterChange` hooks. Pages are statically generated with on-demand revalidation (no slow rebuilds).
- List views: articles show title, status, primary category, authors and publishedAt, with filters by status, category, author and `reviewStatus`.
- Image upload: require alt text; enable focal point; show the 16:10 and 4:5 crops.
- Write a short **`EDITOR_GUIDE.md`** (plain English, with screenshots if possible): how to log in, write and publish an article, schedule one, add an image with caption, embed a video, add or hide a team member, revoke a press card, change contact details, and read contact messages.

---

## 7. SEO

- `generateMetadata` for every route: title template `%s | Beauty of Bharat`, meta description, canonical URL, Open Graph + Twitter cards (article OG image = `seo.ogImage` → hero → default). Add `article:published_time`, `article:modified_time`, `article:author` and `article:section`.
- **Dynamic OG images** (`opengraph-image.tsx`) for articles and people when no OG image is set: white background, tricolour strip, serif headline, logo.
- **JSON-LD structured data**:
  - Site-wide: `NewsMediaOrganization` (name, url, logo, sameAs social links, publishingPrinciples → /about) and `WebSite` with `SearchAction` → `/search?q=`.
  - Article: `NewsArticle` (headline, description, image [16:9, 4:3, 1:1], datePublished, dateModified, author → `Person` with url to profile, publisher, articleSection, contentLocation).
  - Profile: `ProfilePage` with `mainEntity: Person` (name, jobTitle, image, worksFor, sameAs).
  - Breadcrumbs: `BreadcrumbList` on articles, categories and profiles.
- `sitemap.xml` (all public pages, articles, categories, people), **`news-sitemap.xml`** (articles from the last 48 hours, Google News format), `robots.txt` (disallow `/admin`, `/api`, `/search`), RSS 2.0 feed at `/rss.xml` (latest 30, with full summary + image). Article `noIndex` excludes it everywhere.
- Clean, lowercase, hyphenated slugs. Changing a slug creates a 301 redirect from the old one (store old slugs in a `redirects` collection or use `@payloadcms/plugin-redirects`).
- Semantic HTML: one `<h1>` per page, `<article>`, `<time datetime>`, `<figure>/<figcaption>`, `<nav aria-label>`.

---

## 8. Performance

Targets on a mid-range phone over 4G: **LCP < 2.5s, CLS < 0.05, INP < 200ms; Lighthouse ≥ 95** for Performance, Accessibility, Best Practices and SEO on Home, Article and People.
- `next/image` everywhere with correct `sizes`. Only the home hero / article hero gets `priority`; everything else lazy-loads. Use `placeholder` colour backgrounds (or blur hashes) so nothing jumps.
- Fonts through `next/font` with `display: swap`. Load only the weights listed.
- **Video embeds are click-to-load facades**: show the poster image + play button and inject the iframe only on click (`youtube-nocookie.com` for YouTube).
- Minimal client JS. No analytics or tracking scripts by default. If analytics is needed later, use a cookie-less option (e.g. Plausible) behind an env var.
- Cache public API responses, and gzip/brotli. Images are served from the CDN/R2 with long cache headers.

---

## 9. Accessibility (WCAG 2.2 AA)

- All text meets contrast (use `green-text` `#0E7A41`, not `#108547`, for small text; never put white text on saffron).
- Visible focus states, skip-to-content link, keyboard-operable mobile menu with focus trap, `aria-label` on icon-only buttons (search, share, social, menu, play).
- Touch targets ≥ 44×44px.
- Real `<button>`, `<a>`, `<label>` + `<input>` elements, form errors announced (`aria-live`), and `prefers-reduced-motion` respected.
- Images require alt text in the CMS. Decorative images use `alt=""`.
- `lang="en"` on `<html>`. Keep the structure ready for a future Hindi/Punjabi version (don't hard-code strings deep inside components; keep UI strings in one `copy.ts`).

---

## 10. Responsive behaviour

Breakpoints: phone < 760px, tablet 760–1100px, desktop > 1100px. Follow `MobileHome.html` and `MobileArticle.html` for phone layouts:
- Header collapses to logo + search + hamburger. The utility bar is hidden. The category bar stays as a horizontal scroll strip.
- Featured story stacks (image → kicker → headline → deck → meta → full-width button).
- Card grids become single column; secondary lists use compact items with a square thumbnail on the right.
- The people grid becomes 2 columns on small tablets and 1 column on phones (the home people band becomes a horizontal scroll of avatars).
- Article: 16px gutters, body 19px, hero edge to edge, sticky nothing.
- No horizontal page scroll at any width from 320px up.

---

## 11. Security and reliability

- Payload admin behind auth with strong passwords. Optional 2FA if available. Limit login attempts.
- All secrets in env vars. Provide `.env.example`: `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `S3_*`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `CRON_SECRET`, `PREVIEW_SECRET`.
- Sanitise rich-text output (Lexical → React, no raw HTML injection). Allowlist video embed hosts.
- Security headers (CSP allowing only the needed hosts, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- Database migrations committed (`payload migrate:create`). Document a backup approach (e.g. Neon point-in-time restore + R2 bucket versioning).

---

## 12. Seed data

Create `pnpm seed`, which loads **sample content** so every page can be seen working:
- All 11 categories, ~10 locations, 8 people and ~14 articles, based on the sample content inside the `renderVals()` blocks of the design-reference files (headlines, names, roles, cities, card numbers). Use placeholder images (solid `placeholder`-coloured images or generated neutral images; **no stock photos of real people**).
- Mark every seeded document with `isSample: true`, and provide `pnpm seed:clear`, which deletes all sample content so the team can launch with real stories.
- Seed `siteSettings` with placeholder emails (`tips@thebeautyofbharat.com`, `press@…`, `hello@…`, `corrections@…`) and `[WhatsApp number]`, clearly flagged to update before launch.
- Create the first admin user from env vars (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`).

---

## 13. Testing and quality

- ESLint + Prettier + `tsc --noEmit` clean.
- **Unit tests** (Vitest): read-time calculation, slug generation, date formatting (Asia/Kolkata), people filtering, access-control rules (reporter cannot publish; hidden/revoked people are not public).
- **E2E tests** (Playwright, desktop + mobile viewports): home loads with featured story; open an article from a card; author link → profile lists that article; people filters work; mobile menu opens/closes with keyboard; contact form validation + successful submission (mock email); 404 page; unpublished article returns 404; scheduled article appears after its time (simulate with a test hook).
- Accessibility check with `@axe-core/playwright` on every page template: zero serious/critical issues.
- Lighthouse CI on Home, Article and People against the targets in section 8.
- **Visual check**: screenshot each page at 1440px and 390px and compare it side by side with the matching `design-reference/` file. List any intentional differences in `README.md`.

---

## 14. Phases (build in this order)

**Phase 1: Foundation**
Set up Next.js + Payload + Postgres (Docker Compose for local DB) + Tailwind with all tokens + fonts + logo/favicons. Build the layout shell: `SiteHeader`, `MobileNav`, `SiteFooter`, `TricolourRule`, 404 page.
*Done when:* the shell matches the designs at 1440 and 390px, and `/admin` login works.

**Phase 2: Data model and CMS**
All collections, globals, access control, drafts/versions, scheduled publishing, image sizes, S3 storage adapter, live preview, revalidation hooks, admin branding, seed scripts.
*Done when:* an editor can create, schedule, publish and unpublish an article and a person, a reporter cannot publish, and `pnpm seed` fills the site.

**Phase 3: Public pages**
Home, News, Category, Article (all rich-text blocks), People, Profile, About, Contact (form + email + spam protection), Search, Privacy/Terms.
*Done when:* every page matches its design reference and works with seeded content on desktop and mobile.

**Phase 4: SEO, performance, accessibility**
Metadata, OG images, JSON-LD, sitemaps, RSS, redirects, video facades, image tuning, a11y fixes.
*Done when:* Lighthouse ≥ 95 in all four categories on Home, Article and People, axe shows zero serious issues, and Google's Rich Results Test passes for an article URL (document how to check).

**Phase 5: Tests, docs, deploy**
Unit + E2E tests, `README.md` (setup, env vars, commands, architecture), `EDITOR_GUIDE.md`, `DEPLOY.md` (Vercel + Neon + R2 step by step, plus a Docker/VPS alternative, domain + DNS for thebeautyofbharat.com, cron for scheduled publishing, Resend domain verification).
*Done when:* tests pass and a fresh clone can be set up by following `README.md` alone.

---

## 15. Things to avoid

- No paywall, login wall, subscription prompts, newsletter popups, cookie walls (none are needed without tracking) or ads.
- No clickbait styling: no red "BREAKING" badges, tickers, autoplaying video, carousels/sliders, infinite scroll or cluttered sidebars.
- No stock photography of people, no AI-generated "reporter" photos, no invented quotes or facts in production content.
- No heavy UI libraries, animation libraries, jQuery or client-side data fetching for page content.
- Don't change the brand colours, logo or the approved layouts without flagging it in `README.md` under "Deviations from design".

When everything is done, give me: a summary of what was built, how to run it locally, how to deploy it, the list of placeholder content and settings that must be replaced before launch, and any open questions.
