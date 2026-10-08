// Manual check for scheduled publishing: `pnpm payload run scripts/verify-schedule.ts`.
// Creates a draft, schedules it 3 seconds ahead, runs the jobs queue and confirms it went live.
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const context = { disableRevalidate: true }

const [category, media, person, admin] = await Promise.all([
  payload.find({ collection: 'categories', limit: 1 }).then((r) => r.docs[0]),
  payload.find({ collection: 'media', limit: 1 }).then((r) => r.docs[0]),
  payload.find({ collection: 'people', limit: 1 }).then((r) => r.docs[0]),
  payload
    .find({ collection: 'users', where: { role: { equals: 'admin' } }, limit: 1 })
    .then((r) => r.docs[0]),
])

const draft = await payload.create({
  collection: 'articles',
  draft: true,
  data: {
    title: 'Scheduled publishing check',
    deck: 'Temporary story created by scripts/verify-schedule.ts',
    body: {
      root: {
        type: 'root',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                text: 'Temporary text.',
                format: 0,
                style: '',
                mode: 'normal',
                detail: 0,
                version: 1,
              },
            ],
          },
        ],
      },
    },
    heroImage: media.id,
    primaryCategory: category.id,
    authors: [person.id],
    _status: 'draft',
  },
  context,
})

const waitUntil = new Date(Date.now() + 3000)
await payload.jobs.queue({
  task: 'schedulePublish',
  waitUntil,
  input: {
    type: 'publish',
    doc: { relationTo: 'articles', value: draft.id },
    user: { relationTo: 'users', value: admin.id },
  },
})

const before = await payload.findByID({ collection: 'articles', id: draft.id })
await payload.jobs.run()
const tooEarly = await payload.findByID({ collection: 'articles', id: draft.id })
await new Promise((r) => setTimeout(r, 3500))
await payload.jobs.run()
const after = await payload.findByID({ collection: 'articles', id: draft.id })

const ok =
  before._status === 'draft' && tooEarly._status === 'draft' && after._status === 'published'
console.log(
  `before=${before._status} beforeTime=${tooEarly._status} afterTime=${after._status} publishedAt=${after.publishedAt}`,
)
console.log(ok ? 'PASS scheduled publishing' : 'FAIL scheduled publishing')

await payload.delete({ collection: 'articles', id: draft.id, context })
process.exit(ok ? 0 : 1)
