import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

/**
 * Turns on draft mode for logged-in CMS users and opens the requested page, so editors can
 * see unpublished changes. Used by the admin "Preview" button and Live Preview.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') ?? ''
  const secret = searchParams.get('previewSecret')

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('You are not allowed to preview this page.', { status: 403 })
  }
  // Only same-site relative paths, never "//evil.example".
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid preview path.', { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const draft = await draftMode()
  if (!user) {
    draft.disable()
    return new Response('Please log in to the CMS to preview drafts.', { status: 403 })
  }

  draft.enable()
  redirect(path)
}
