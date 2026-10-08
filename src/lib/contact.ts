import { copy } from './copy'

export const TOPICS = ['news-tip', 'press', 'general', 'correction'] as const
export type Topic = (typeof TOPICS)[number]

export const TOPIC_LABELS: Record<Topic, string> = {
  'news-tip': 'News tip',
  press: 'Press enquiry',
  general: 'General enquiry',
  correction: 'Correction',
}

/** `?topic=` values accepted from links (e.g. the article "Request a correction" link). */
export function topicFromParam(value: string | string[] | undefined): Topic {
  const v = (Array.isArray(value) ? value[0] : value)?.toLowerCase()
  if (v === 'tip' || v === 'news-tip' || v === 'tips') return 'news-tip'
  if (v === 'press') return 'press'
  if (v === 'correction' || v === 'corrections') return 'correction'
  if (v === 'general') return 'general'
  return 'news-tip'
}

export type ContactValues = {
  name: string
  contact: string
  topic: string
  message: string
  articleUrl: string
}

export type ContactErrors = Partial<Record<keyof ContactValues | 'captcha' | 'form', string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^\+?[\d\s().-]{7,20}$/

export const isEmail = (v: string) => EMAIL.test(v.trim())

/** Server-side (and unit-tested) validation. Returns an empty object when valid. */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {}
  if (values.name.trim().length < 2 || values.name.length > 120)
    errors.name = copy.contact.errors.name
  const contact = values.contact.trim()
  if (!contact) errors.contact = copy.contact.errors.contact
  else if (!EMAIL.test(contact) && !(PHONE.test(contact) && contact.replace(/\D/g, '').length >= 7))
    errors.contact = copy.contact.errors.contactFormat
  if (!(TOPICS as readonly string[]).includes(values.topic))
    errors.topic = copy.contact.errors.topic
  if (values.message.trim().length < 10 || values.message.length > 5000)
    errors.message = copy.contact.errors.message
  if (values.topic === 'correction') {
    const url = values.articleUrl.trim()
    if (!/^https?:\/\/\S+$/.test(url) || url.length > 500)
      errors.articleUrl = copy.contact.errors.articleUrl
  }
  return errors
}

/** Contact submissions allowed per IP per hour. */
export const RATE_LIMIT_PER_HOUR = 5
