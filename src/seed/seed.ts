import type { Payload } from 'payload'
import sharp from 'sharp'

import { slugify } from '@/lib/text'

import { clearSampleContent } from './clearSample'
import * as sample from './data'
import { block, doc, h2, link, p } from './lexical'

/**
 * `pnpm seed` — loads clearly-marked SAMPLE content so every page can be seen working,
 * and creates the first admin from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 * Re-running replaces the previous sample content. `pnpm seed:clear` removes it.
 */
const context = { disableRevalidate: true }

async function placeholderImage(
  payload: Payload,
  tone: string,
  name: string,
  width = 2400,
  height = 1500,
) {
  const data = await sharp({ create: { width, height, channels: 3, background: tone } })
    .jpeg({ quality: 70 })
    .toBuffer()
  return payload.create({
    collection: 'media',
    data: {
      alt: 'Sample placeholder image (a plain colour block)',
      credit: 'Sample image',
      isSample: true,
    },
    file: { data, mimetype: 'image/jpeg', name: `sample-${name}.jpg`, size: data.length },
    context,
  })
}

async function ensureAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) {
    payload.logger.warn('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user.')
    return
  }
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })
  if (existing.totalDocs) {
    payload.logger.info(`Admin ${email} already exists.`)
    return
  }
  await payload.create({
    collection: 'users',
    data: { email, password, name: 'Site admin', role: 'admin' },
    context,
  })
  payload.logger.info(`Created admin ${email}.`)
}

export async function seed(payload: Payload) {
  await ensureAdmin(payload)
  await clearSampleContent(payload)

  // Categories
  const categoryIds = new Map<string, number>()
  for (const [i, c] of sample.categories.entries()) {
    const created = await payload.create({
      collection: 'categories',
      data: {
        ...c,
        slug: slugify(c.name),
        order: (i + 1) * 10,
        showInCategoryBar: true,
        isSample: true,
      },
      context,
    })
    categoryIds.set(c.name, created.id)
  }

  // Locations
  const locationIds = new Map<string, number>()
  for (const [name, state] of sample.locations) {
    const created = await payload.create({
      collection: 'locations',
      data: { name, state, slug: slugify(name), isSample: true },
      context,
    })
    locationIds.set(name, created.id)
  }

  // People (no photos: the site shows initials until real portraits are uploaded)
  const personIds = new Map<string, number>()
  for (const [i, person] of sample.people.entries()) {
    const firstName = person.name.split(' ')[0].toLowerCase()
    const created = await payload.create({
      collection: 'people',
      data: {
        fullName: person.name,
        slug: slugify(person.name),
        designation: person.designation,
        roleType: person.roleType,
        location: locationIds.get(person.city),
        shortBio: person.shortBio,
        bio: doc(p(person.bio)),
        pressCardNumber: person.card,
        pressCardStatus: 'active',
        dateJoined: person.joined,
        socialLinks: [{ platform: 'email', url: `${firstName}@thebeautyofbharat.com` }],
        showOnPeoplePage: true,
        order: (i + 1) * 10,
        isSample: true,
        _status: 'published',
      },
      context,
    })
    personIds.set(person.name, created.id)
  }

  // Articles
  const articleIds = new Map<string, number>()
  for (const a of sample.articles) {
    const hero = await placeholderImage(payload, a.tone, a.key)
    const body =
      a.key === 'courtyard'
        ? await courtyardBody(payload)
        : doc(
            p(a.deck),
            p(sample.PLACEHOLDER_PARAGRAPH),
            h2('Sample heading'),
            p(sample.PLACEHOLDER_PARAGRAPH),
            p(sample.PLACEHOLDER_PARAGRAPH),
          )
    const created = await payload.create({
      collection: 'articles',
      data: {
        title: a.title,
        slug: slugify(a.title),
        deck: a.deck,
        excerpt: a.excerpt,
        heroImage: hero.id,
        heroCaption:
          a.key === 'courtyard'
            ? 'Children finish their homework in the courtyard as evening falls.'
            : 'Sample photograph.',
        heroCredit: `Photo: ${a.author} / Beauty of Bharat`,
        body,
        authors: [personIds.get(a.author)!],
        primaryCategory: categoryIds.get(a.category)!,
        categories: (a.extraCategories ?? []).map((c) => categoryIds.get(c)!),
        location: locationIds.get(a.city),
        publishedAt: a.date,
        featured: Boolean(a.featured),
        isSample: true,
        _status: 'published',
      },
      context,
    })
    articleIds.set(a.key, created.id)
  }

  // About, Privacy, Terms
  await payload.create({
    collection: 'pages',
    data: {
      title: 'About',
      slug: 'about',
      isSample: true,
      _status: 'published',
      seo: {
        metaDescription:
          'Beauty of Bharat is a free newspaper focused on uplifting stories about India, from ground zero.',
      },
      layout: [
        {
          blockType: 'statementHero',
          kicker: 'About Beauty of Bharat',
          heading: sample.about.hero,
          showMark: true,
        },
        {
          blockType: 'twoColumnText',
          heading: 'Why we exist',
          body: doc(...sample.about.why.map((t) => p(t))),
        },
        {
          blockType: 'numberedList',
          heading: 'What we cover',
          items: sample.about.cover.map(([title, text]) => ({ title, text })),
        },
        {
          blockType: 'cardGrid',
          heading: 'How we work',
          background: 'sand',
          cards: sample.about.principles.map(([title, text]) => ({ title, text })),
        },
        {
          blockType: 'ctaRow',
          heading: 'Read the stories. Meet the people who report them.',
          primary: { label: 'Read the latest', url: '/news' },
          secondary: { label: 'Meet the team', url: '/people' },
        },
      ],
    },
    context,
  })
  for (const [title, slug] of [
    ['Privacy Policy', 'privacy'],
    ['Terms of Use', 'terms'],
  ]) {
    await payload.create({
      collection: 'pages',
      data: {
        title,
        slug,
        isSample: true,
        _status: 'published',
        layout: [
          {
            blockType: 'richText',
            content: doc(
              p(
                'PLACEHOLDER — this page must be replaced with text reviewed by a lawyer before launch.',
              ),
              h2('Summary'),
              p(
                slug === 'privacy'
                  ? 'Beauty of Bharat does not use advertising, tracking cookies or third-party analytics. Messages sent through the contact form are stored so the right desk can reply, and are not shared.'
                  : 'Stories on Beauty of Bharat are free to read. Please credit Beauty of Bharat and link to the original story when quoting our reporting.',
              ),
            ),
          },
        ],
      },
      context,
    })
  }

  // Site settings (placeholders are flagged in the admin and in README)
  await payload.updateGlobal({
    slug: 'siteSettings',
    data: {
      socialLinks: [
        { platform: 'instagram', url: 'https://www.instagram.com/' },
        { platform: 'youtube', url: 'https://www.youtube.com/' },
        { platform: 'whatsapp', url: 'https://www.whatsapp.com/channel/' },
        { platform: 'x', url: 'https://x.com/' },
      ],
      whatsappNumber: '[WhatsApp number]',
      homepage: {
        latestCount: 6,
        groundReportsCategory: categoryIds.get('Ground Reports'),
        mostReadMode: 'pinned',
        mostReadPinned: sample.mostRead.map((k) => articleIds.get(k)!),
        showPeopleBand: true,
        showTipBand: true,
        peopleBandPeople: sample.peopleBand.map((n) => personIds.get(n)!),
      },
    },
    context,
  })

  payload.logger.info(
    `Seeded ${categoryIds.size} categories, ${locationIds.size} locations, ${personIds.size} people, ${articleIds.size} articles and 3 pages.`,
  )
}

/** The full sample story from Article.html, using every rich-text block. */
async function courtyardBody(payload: Payload) {
  const inline = await placeholderImage(payload, '#DDE3DC', 'courtyard-inline', 1880, 1253)
  const poster = await placeholderImage(payload, '#16161D', 'courtyard-video', 1600, 900)
  return doc(
    p(
      'The first children arrive a little after five, their school bags still on their backs. By six, the courtyard is full — older students helping younger ones with sums, a radio playing softly in the kitchen, a blackboard propped against the wall.',
    ),
    p(
      'She taught in government schools for most of her working life. When she retired, she says, the house felt too quiet. “I kept the door open one evening for a neighbour’s son who was struggling with English. The next week he brought two friends.”',
    ),
    h2('A classroom without walls'),
    p(
      'There is no fee and no sign outside. Parents send vegetables, a sack of flour at harvest, sometimes a new box of chalk. Former students who now study in the city come back on weekends to teach science and computers. ',
      link(
        'Read how other villages in the district are running similar schools.',
        '/category/education',
      ),
    ),
    block('pullQuote', {
      quote:
        '“Nobody asks them for marks here. They come because they want to learn — that is the whole secret.”',
      attribution: 'The teacher, at her home in Ludhiana district',
    }),
    p(
      'Teachers at the nearby government school have noticed the difference. Homework comes back finished. Children who barely spoke in class now raise their hands.',
    ),
    block('imageBlock', {
      image: inline.id,
      caption: 'Former students return on weekends to teach computer basics.',
      credit: 'Photo: Harleen Kaur / Beauty of Bharat',
      size: 'wide',
    }),
    h2('Watch: an evening in the courtyard'),
    block('videoEmbed', {
      // SAMPLE: not a real video. Replace with a real YouTube/Vimeo/Instagram link.
      url: 'https://www.youtube.com/watch?v=SAMPLEVIDEO',
      caption: '',
      duration: '3:12',
      poster: poster.id,
    }),
    p(
      'As the light fades, the children pack up. Some walk home together in groups; a few wait for older siblings on bicycles. The door, she says, will stay open as long as they keep coming.',
    ),
  )
}
