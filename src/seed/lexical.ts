import { randomBytes } from 'crypto'

import type { Article } from '@/payload-types'

/** Minimal builders for Lexical editor state, used only by the seed script. */

type Node = Record<string, unknown>

const text = (value: string, format = 0): Node => ({
  type: 'text',
  text: value,
  format,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})

const element = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  ...extra,
})

export const p = (...parts: Array<string | Node>): Node =>
  element(
    'paragraph',
    parts.map((part) => (typeof part === 'string' ? text(part) : part)),
    { textFormat: 0, textStyle: '' },
  )

export const h2 = (value: string): Node => element('heading', [text(value)], { tag: 'h2' })

export const link = (label: string, url: string): Node =>
  element('link', [text(label)], {
    version: 3,
    fields: { linkType: 'custom', url, newTab: false },
  })

export const block = (blockType: string, fields: Node): Node => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { id: randomBytes(12).toString('hex'), blockName: '', blockType, ...fields },
})

/** A complete editor state, typed as Payload's rich-text value. */
export const doc = (...children: Node[]): Article['body'] =>
  ({ root: element('root', children) }) as unknown as Article['body']
