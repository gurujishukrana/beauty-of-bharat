import type { Access, FieldAccess, Where } from 'payload'

export type Role = 'admin' | 'editor' | 'reporter'

type MaybeUser = { id?: number | string; role?: Role | null; person?: unknown } | null | undefined

export const roleOf = (user: unknown): Role | null => (user as MaybeUser)?.role ?? null

export const hasRole = (user: unknown, ...roles: Role[]): boolean => {
  const role = roleOf(user)
  return role !== null && roles.includes(role)
}

/** The People profile linked to a CMS login (used to decide which articles a reporter owns). */
export const personIdOf = (user: unknown): number | string | null => {
  const person = (user as MaybeUser)?.person
  if (person === null || person === undefined) return null
  if (typeof person === 'object') return (person as { id?: number | string }).id ?? null
  return person as number | string
}

export const anyone: Access = () => true
export const nobody: Access = () => false
export const loggedIn: Access = ({ req }) => Boolean(req.user)
export const adminOnly: Access = ({ req }) => hasRole(req.user, 'admin')
/** Admins and editors. */
export const staff: Access = ({ req }) => hasRole(req.user, 'admin', 'editor')

export const adminOnlyField: FieldAccess = ({ req }) => hasRole(req.user, 'admin')
export const staffField: FieldAccess = ({ req }) => hasRole(req.user, 'admin', 'editor')

export const publishedWhere: Where = { _status: { equals: 'published' } }

/** Logged-in users see everything; the public sees only published documents. */
export const loggedInOrPublished: Access = ({ req }) => (req.user ? true : publishedWhere)

/** People are public only when published, holding an active press card, and not hidden. */
export const publicPeopleWhere: Where = {
  and: [
    { _status: { equals: 'published' } },
    { pressCardStatus: { equals: 'active' } },
    { showOnPeoplePage: { equals: true } },
  ],
}

const isPublishing = (data: unknown) =>
  (data as { _status?: string } | undefined)?._status === 'published'

/** Articles a reporter owns: drafts where their People profile is one of the authors. */
const reporterOwnDrafts = (user: unknown): Where | false => {
  const personId = personIdOf(user)
  if (personId === null) return false
  return {
    and: [{ authors: { in: [personId] } }, { _status: { not_equals: 'published' } }],
  }
}

export const articleAccess = {
  read: (({ req }) => {
    if (hasRole(req.user, 'admin', 'editor')) return true
    if (hasRole(req.user, 'reporter')) {
      const personId = personIdOf(req.user)
      return personId === null
        ? publishedWhere
        : { or: [publishedWhere, { authors: { in: [personId] } }] }
    }
    return publishedWhere
  }) satisfies Access,

  create: (({ req, data }) => {
    if (hasRole(req.user, 'admin', 'editor')) return true
    // Reporters may create drafts but never publish. Payload asks this same question (with
    // `_status: 'published'`) to decide whether to show the Publish button.
    return hasRole(req.user, 'reporter') && !isPublishing(data)
  }) satisfies Access,

  update: (({ req, data }) => {
    if (hasRole(req.user, 'admin', 'editor')) return true
    if (hasRole(req.user, 'reporter')) {
      if (isPublishing(data)) return false
      return reporterOwnDrafts(req.user)
    }
    return false
  }) satisfies Access,

  delete: staff,
}
