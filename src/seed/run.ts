// `pnpm seed` — loads sample content and the first admin user.
import config from '@payload-config'
import { getPayload } from 'payload'

import { seed } from './seed'

const payload = await getPayload({ config })
await seed(payload)
process.exit(0)
