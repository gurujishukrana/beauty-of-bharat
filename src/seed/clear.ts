// `pnpm seed:clear` — deletes all sample content (documents marked isSample).
import config from '@payload-config'
import { getPayload } from 'payload'

import { clearSampleContent } from './clearSample'

const payload = await getPayload({ config })
const total = await clearSampleContent(payload)
payload.logger.info(`Done. Removed ${total} sample documents.`)
process.exit(0)
