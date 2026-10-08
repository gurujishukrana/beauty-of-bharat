'use server'

import { createHash } from 'crypto'
import { headers } from 'next/headers'

import {
  RATE_LIMIT_PER_HOUR,
  TOPIC_LABELS,
  isEmail,
  validateContact,
  type ContactErrors,
  type ContactValues,
  type Topic,
} from '@/lib/contact'
import { copy } from '@/lib/copy'
import { sendEmail, verifyTurnstile } from '@/lib/email'
import { getPayloadClient, getSiteSettings } from '@/lib/queries'

export type ContactState =
  | { status: 'idle' }
  | { status: 'error'; errors: ContactErrors; values: ContactValues }
  | { status: 'success' }

const field = (data: FormData, name: string) => String(data.get(name) ?? '').slice(0, 6000)

async function clientIp(): Promise<string | null> {
  const h = await headers()
  return (
    h.get('cf-connecting-ip') ||
    h.get('x-real-ip') ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null
  )
}

export async function submitContact(_prev: ContactState, data: FormData): Promise<ContactState> {
  const values: ContactValues = {
    name: field(data, 'name').trim(),
    contact: field(data, 'contact').trim(),
    topic: field(data, 'topic'),
    message: field(data, 'message').trim(),
    articleUrl: field(data, 'articleUrl').trim(),
  }

  // Honeypot: real people never see or fill this field. Pretend it worked.
  if (field(data, 'website')) return { status: 'success' }

  const errors = validateContact(values)
  if (Object.keys(errors).length) return { status: 'error', errors, values }

  const ip = await clientIp()
  if (!(await verifyTurnstile(field(data, 'cf-turnstile-response') || null, ip))) {
    return { status: 'error', errors: { captcha: copy.contact.errors.captcha }, values }
  }

  const payload = await getPayloadClient()
  const ipHash = ip
    ? createHash('sha256').update(`${process.env.PAYLOAD_SECRET}:${ip}`).digest('hex').slice(0, 32)
    : null

  if (ipHash) {
    const { totalDocs } = await payload.count({
      collection: 'contactSubmissions',
      where: {
        and: [
          { ipHash: { equals: ipHash } },
          { createdAt: { greater_than: new Date(Date.now() - 3600_000).toISOString() } },
        ],
      },
    })
    if (totalDocs >= RATE_LIMIT_PER_HOUR) {
      return { status: 'error', errors: { form: copy.contact.errors.rateLimit }, values }
    }
  }

  try {
    const topic = values.topic as Topic
    const submission = await payload.create({
      collection: 'contactSubmissions',
      data: {
        name: values.name,
        contact: values.contact,
        topic,
        message: values.message,
        articleUrl: topic === 'correction' ? values.articleUrl : undefined,
        status: 'new',
        ipHash: ipHash ?? undefined,
      },
    })

    const settings = await getSiteSettings()
    const desks = settings.contactEmails
    const to = {
      'news-tip': desks?.tips,
      press: desks?.press,
      general: desks?.general,
      correction: desks?.corrections,
    }[topic]

    if (to) {
      const sent = await sendEmail({
        to,
        subject: `[${TOPIC_LABELS[topic]}] from ${values.name}`,
        replyTo: isEmail(values.contact) ? values.contact : undefined,
        text: [
          `Name: ${values.name}`,
          `Email or phone: ${values.contact}`,
          `Topic: ${TOPIC_LABELS[topic]}`,
          topic === 'correction' ? `Article: ${values.articleUrl}` : null,
          '',
          values.message,
          '',
          `— Sent from the contact form. Message #${submission.id} in the CMS inbox.`,
        ]
          .filter((line) => line !== null)
          .join('\n'),
      })
      if (sent) {
        await payload.update({
          collection: 'contactSubmissions',
          id: submission.id,
          data: { emailed: true },
        })
      }
    }
  } catch (error) {
    console.error('[contact] could not save submission', error)
    return { status: 'error', errors: { form: copy.contact.errors.generic }, values }
  }

  return { status: 'success' }
}
