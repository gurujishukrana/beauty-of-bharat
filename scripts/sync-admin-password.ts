// Sets the admin account's password to SEED_ADMIN_PASSWORD from .env.
// Usage: pnpm payload run scripts/sync-admin-password.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const email = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD
if (!email || !password) throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env')

const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (!docs[0]) throw new Error(`No account with email ${email}. Run pnpm seed to create it.`)
await payload.update({ collection: 'users', id: docs[0].id, data: { password } })
payload.logger.info(`Password updated for ${email}.`)
process.exit(0)
