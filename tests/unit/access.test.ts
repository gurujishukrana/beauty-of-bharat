import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { articleAccess, loggedInOrPublished, publicPeopleWhere } from '@/access'
import { People } from '@/collections/People'

const req = (user: Record<string, unknown> | null) => ({
  req: { user } as unknown as PayloadRequest,
})
const reporter = { id: 3, role: 'reporter', person: 7 }
const editor = { id: 2, role: 'editor' }
const admin = { id: 1, role: 'admin' }
const published = { _status: 'published' }
const draft = { _status: 'draft' }

type AccessFn = (args: Record<string, unknown>) => unknown
const call = (fn: unknown, args: Record<string, unknown>) => (fn as AccessFn)(args)

describe('article access', () => {
  it('reporters cannot publish, on create or update', () => {
    expect(call(articleAccess.create, { ...req(reporter), data: published })).toBe(false)
    expect(call(articleAccess.update, { ...req(reporter), data: published })).toBe(false)
  })

  it('reporters can create drafts and edit only their own unpublished drafts', () => {
    expect(call(articleAccess.create, { ...req(reporter), data: draft })).toBe(true)
    expect(call(articleAccess.update, { ...req(reporter), data: draft })).toEqual({
      and: [{ authors: { in: [7] } }, { _status: { not_equals: 'published' } }],
    })
  })

  it('reporters without a linked profile cannot edit anything', () => {
    expect(call(articleAccess.update, { ...req({ id: 9, role: 'reporter' }), data: draft })).toBe(
      false,
    )
  })

  it('editors and admins can publish', () => {
    expect(call(articleAccess.update, { ...req(editor), data: published })).toBe(true)
    expect(call(articleAccess.create, { ...req(admin), data: published })).toBe(true)
  })

  it('only staff can delete', () => {
    expect(call(articleAccess.delete, req(reporter))).toBe(false)
    expect(call(articleAccess.delete, req(editor))).toBe(true)
  })

  it('the public reads only published stories', () => {
    expect(call(articleAccess.read, req(null))).toEqual({ _status: { equals: 'published' } })
    expect(call(loggedInOrPublished, req(null))).toEqual({ _status: { equals: 'published' } })
  })
})

describe('people access', () => {
  it('hides unpublished, hidden and suspended/revoked profiles from the public', () => {
    const read = People.access?.read
    expect(call(read, req(null))).toEqual(publicPeopleWhere)
    expect(publicPeopleWhere).toEqual({
      and: [
        { _status: { equals: 'published' } },
        { pressCardStatus: { equals: 'active' } },
        { showOnPeoplePage: { equals: true } },
      ],
    })
  })

  it('reporters cannot edit people', () => {
    expect(call(People.access?.update, req(reporter))).toBe(false)
    expect(call(People.access?.update, req(editor))).toBe(true)
  })
})
