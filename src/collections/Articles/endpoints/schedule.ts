import type { Endpoint } from 'payload'

import { hasRole } from '@/access'

/**
 * POST /api/articles/:id/schedule  { "publishAt": "2026-10-09T06:00:00+05:30" }
 * Queues a scheduled publish, exactly like the admin's "Schedule publish" button.
 * Staff only. Used by scripts and the E2E tests.
 */
export const scheduleEndpoint: Endpoint = {
  path: '/:id/schedule',
  method: 'post',
  handler: async (req) => {
    if (!hasRole(req.user, 'admin', 'editor') || !req.user) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    const id = Number(req.routeParams?.id)
    const body = (await req.json?.().catch(() => ({}))) as { publishAt?: string }
    const publishAt = new Date(body?.publishAt ?? '')
    if (!Number.isInteger(id) || Number.isNaN(publishAt.getTime())) {
      return Response.json(
        { error: 'Send an article id and a valid publishAt date.' },
        { status: 400 },
      )
    }
    await req.payload.findByID({ collection: 'articles', id, draft: true, req })
    const job = await req.payload.jobs.queue({
      task: 'schedulePublish',
      waitUntil: publishAt,
      input: {
        type: 'publish',
        doc: { relationTo: 'articles', value: id },
        user: { relationTo: 'users', value: req.user.id as number },
      },
      req,
    })
    return Response.json({ jobId: job.id, publishAt: publishAt.toISOString() }, { status: 201 })
  },
}
