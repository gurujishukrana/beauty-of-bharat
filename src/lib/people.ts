import type { Person } from '@/payload-types'

/** Mirrors the public access rule: published, active press card, shown on the People page. */
export function isPublicPerson(p: Partial<Person> | null | undefined): boolean {
  return Boolean(
    p && p._status === 'published' && p.pressCardStatus === 'active' && p.showOnPeoplePage !== false,
  )
}

export const ROLE_FILTERS = [
  { value: 'editor', label: 'Editors' },
  { value: 'reporter', label: 'Reporters' },
  { value: 'photographer', label: 'Photographers' },
  { value: 'contributor', label: 'Contributors' },
] as const

export type RoleFilter = (typeof ROLE_FILTERS)[number]['value']

export type PeopleFilters = { role: RoleFilter | null; state: string | null; q: string }

/** Reads `/people?role=reporter&state=punjab&q=pune` safely. Unknown values are ignored. */
export function parsePeopleFilters(params: Record<string, string | string[] | undefined>): PeopleFilters {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''
  const role = first(params.role).toLowerCase()
  const state = first(params.state).trim().toLowerCase()
  return {
    role: ROLE_FILTERS.some((r) => r.value === role) ? (role as RoleFilter) : null,
    state: state && /^[a-z -]{2,40}$/.test(state) ? state : null,
    q: first(params.q).trim().slice(0, 80),
  }
}

type FilterablePerson = {
  fullName: string
  roleType?: string | null
  designation?: string | null
  location?: { name?: string | null; state?: string | null } | number | null
}

/** Pure filter used by the People page (and its unit tests). */
export function filterPeople<T extends FilterablePerson>(people: T[], filters: PeopleFilters): T[] {
  const terms = filters.q.toLowerCase().split(/\s+/).filter(Boolean)
  return people.filter((p) => {
    const loc = typeof p.location === 'object' && p.location ? p.location : null
    if (filters.role && p.roleType !== filters.role) return false
    if (filters.state && (loc?.state ?? '').toLowerCase() !== filters.state) return false
    if (terms.length) {
      const haystack = [p.fullName, p.designation, loc?.name, loc?.state].filter(Boolean).join(' ').toLowerCase()
      return terms.every((t) => haystack.includes(t))
    }
    return true
  })
}

/** Builds a `/people` URL with the given filters (used by the filter chips). */
export function peopleHref(filters: Partial<PeopleFilters>): string {
  const params = new URLSearchParams()
  if (filters.role) params.set('role', filters.role)
  if (filters.state) params.set('state', filters.state)
  if (filters.q) params.set('q', filters.q)
  const qs = params.toString()
  return qs ? `/people?${qs}` : '/people'
}
