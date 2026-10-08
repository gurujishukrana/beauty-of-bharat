import { describe, expect, it } from 'vitest'

import { filterPeople, isPublicPerson, parsePeopleFilters, peopleHref } from '@/lib/people'

const people = [
  {
    fullName: 'Harleen Kaur',
    roleType: 'reporter',
    designation: 'Punjab Correspondent',
    location: { name: 'Ludhiana', state: 'Punjab' },
  },
  {
    fullName: 'Rohit Bains',
    roleType: 'editor',
    designation: 'Founding Editor',
    location: { name: 'Chandigarh', state: 'Chandigarh' },
  },
  {
    fullName: 'Priya Raghavan',
    roleType: 'reporter',
    designation: 'Innovation Reporter',
    location: { name: 'Pune', state: 'Maharashtra' },
  },
  { fullName: 'Meera Iyer', roleType: 'photographer', designation: 'Photo Editor', location: null },
]

describe('people filters', () => {
  it('filters by role', () => {
    const out = filterPeople(people, parsePeopleFilters({ role: 'reporter' }))
    expect(out.map((p) => p.fullName)).toEqual(['Harleen Kaur', 'Priya Raghavan'])
  })

  it('searches name and location, every word must match', () => {
    expect(filterPeople(people, parsePeopleFilters({ q: 'pune' })).map((p) => p.fullName)).toEqual([
      'Priya Raghavan',
    ])
    expect(filterPeople(people, parsePeopleFilters({ q: 'kaur punjab' }))).toHaveLength(1)
    expect(filterPeople(people, parsePeopleFilters({ q: 'kaur pune' }))).toHaveLength(0)
  })

  it('combines role, state and search', () => {
    expect(
      filterPeople(people, parsePeopleFilters({ role: 'reporter', state: 'punjab' })),
    ).toHaveLength(1)
    expect(filterPeople(people, parsePeopleFilters({ role: 'reporter', q: 'pune' }))).toHaveLength(
      1,
    )
  })

  it('ignores unknown or unsafe parameters', () => {
    expect(parsePeopleFilters({ role: 'admin', state: '<script>' })).toEqual({
      role: null,
      state: null,
      q: '',
    })
    expect(filterPeople(people, parsePeopleFilters({ role: 'hacker' }))).toHaveLength(4)
  })

  it('builds shareable URLs', () => {
    expect(peopleHref({ role: 'reporter', q: 'pune' })).toBe('/people?role=reporter&q=pune')
    expect(peopleHref({})).toBe('/people')
  })
})

describe('isPublicPerson', () => {
  const base = { _status: 'published', pressCardStatus: 'active', showOnPeoplePage: true } as const

  it('is public only when published, active and shown', () => {
    expect(isPublicPerson(base)).toBe(true)
    expect(isPublicPerson({ ...base, pressCardStatus: 'revoked' })).toBe(false)
    expect(isPublicPerson({ ...base, pressCardStatus: 'suspended' })).toBe(false)
    expect(isPublicPerson({ ...base, showOnPeoplePage: false })).toBe(false)
    expect(isPublicPerson({ ...base, _status: 'draft' })).toBe(false)
    expect(isPublicPerson(null)).toBe(false)
  })
})
