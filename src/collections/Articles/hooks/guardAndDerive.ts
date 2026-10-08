import { APIError, type CollectionBeforeChangeHook } from 'payload'

import { hasRole, personIdOf } from '@/access'
import { calculateReadTime, lexicalToPlainText } from '@/lib/text'

/**
 * - Reporters can never publish (second line of defence after access control).
 * - A reporter's own profile is always added to the authors of drafts they create.
 * - `publishedAt` defaults to the moment of publishing.
 * - `plainText` and `readTime` are derived from the body.
 */
export const guardAndDerive: CollectionBeforeChangeHook = ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  const user = req.user

  if (hasRole(user, 'reporter')) {
    if (data._status === 'published') {
      throw new APIError(
        'Reporters cannot publish. Use “Submit for review” instead.',
        403,
        null,
        true,
      )
    }
    const personId = personIdOf(user)
    if (operation === 'create' && personId !== null) {
      const authors = Array.isArray(data.authors) ? data.authors : []
      const ids = authors.map((a: unknown) =>
        typeof a === 'object' && a ? (a as { id: unknown }).id : a,
      )
      if (!ids.includes(personId)) data.authors = [...authors, personId]
    }
  }

  if (data._status === 'published' && !data.publishedAt && !originalDoc?.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }

  if (data.body !== undefined) {
    const text = lexicalToPlainText(data.body)
    data.plainText = text
    data.readTime = calculateReadTime(text)
  }

  return data
}
