import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest): Promise<Response> {
  const draft = await draftMode()
  draft.disable()
  const path = new URL(req.url).searchParams.get('path') ?? '/'
  redirect(path.startsWith('/') && !path.startsWith('//') ? path : '/')
}
