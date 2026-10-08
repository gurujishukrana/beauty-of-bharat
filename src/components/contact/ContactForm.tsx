'use client'

import Script from 'next/script'
import { useActionState, useEffect, useRef, useState } from 'react'

import { submitContact, type ContactState } from '@/app/(frontend)/contact/actions'
import { TOPIC_LABELS, TOPICS, type Topic } from '@/lib/contact'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/cn'

const input =
  'h-12 w-full rounded-xs border border-field bg-paper px-3.5 text-[15px] font-normal text-ink aria-[invalid=true]:border-[#B42318]'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <span id={id} className="text-[13px] font-medium text-[#B42318]">
      {message}
    </span>
  )
}

/**
 * Contact form. Works without JavaScript (plain form post to a Server Action); with JS it
 * stays on the page, shows inline errors and a success message, and reveals "Article link"
 * only for corrections.
 */
export function ContactForm({
  initialTopic,
  initialArticle,
}: {
  initialTopic: Topic
  initialArticle: string
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, {
    status: 'idle',
  })
  const errors = state.status === 'error' ? state.errors : {}
  const values = state.status === 'error' ? state.values : null
  const [topic, setTopic] = useState<string>(values?.topic ?? initialTopic)
  const summaryRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (state.status === 'error') summaryRef.current?.focus()
    if (state.status === 'success') successRef.current?.focus()
  }, [state])

  if (state.status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col gap-3 bg-sand p-7 outline-none"
      >
        <h2 className="font-serif text-[26px] font-medium">{copy.contact.successTitle}</h2>
        <p className="text-[15px] leading-[1.6] text-body">{copy.contact.successText}</p>
        <div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 inline-flex h-12 items-center rounded-xs border-[1.5px] border-ink px-6 text-[15px] font-semibold"
          >
            {copy.contact.sendAnother}
          </button>
        </div>
      </div>
    )
  }

  const describedBy = (name: string) =>
    errors[name as keyof typeof errors] ? `${name}-error` : undefined
  const errorCount = Object.keys(errors).length

  return (
    <form action={action} noValidate className="contact-form flex flex-col gap-[18px]">
      <h2 className="mb-1 font-serif text-[28px] font-medium sm:text-[30px]">
        {copy.contact.formTitle}
      </h2>

      <div ref={summaryRef} tabIndex={-1} aria-live="assertive" className="outline-none">
        {errorCount > 0 ? (
          <p className="border-l-[3px] border-[#B42318] bg-[#FEF3F2] px-4 py-3 text-sm text-[#7A271A]">
            {errors.form ?? errors.captcha ?? copy.contact.errors.summary}
          </p>
        ) : null}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex flex-[1_1_220px] flex-col gap-1.5 text-sm font-semibold">
          {copy.contact.name}
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            defaultValue={values?.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            className={input}
          />
          <FieldError id="name-error" message={errors.name} />
        </label>
        <label className="flex flex-[1_1_220px] flex-col gap-1.5 text-sm font-semibold">
          {copy.contact.contact}
          <input
            name="contact"
            type="text"
            autoComplete="email"
            required
            defaultValue={values?.contact}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={describedBy('contact')}
            className={input}
          />
          <FieldError id="contact-error" message={errors.contact} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {copy.contact.topic}
        <select
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          aria-invalid={Boolean(errors.topic)}
          aria-describedby={describedBy('topic')}
          className={cn(input, 'px-3')}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {TOPIC_LABELS[t]}
            </option>
          ))}
        </select>
        <FieldError id="topic-error" message={errors.topic} />
      </label>

      <label
        className={cn(
          'article-field flex flex-col gap-1.5 text-sm font-semibold',
          topic !== 'correction' && 'hidden',
        )}
      >
        {copy.contact.articleUrl}
        <span className="text-[13px] font-normal text-subtle" id="articleUrl-hint">
          {copy.contact.articleUrlHint}
        </span>
        <input
          name="articleUrl"
          type="url"
          inputMode="url"
          defaultValue={values?.articleUrl ?? initialArticle}
          aria-invalid={Boolean(errors.articleUrl)}
          aria-describedby={['articleUrl-hint', describedBy('articleUrl')]
            .filter(Boolean)
            .join(' ')}
          className={input}
        />
        <FieldError id="articleUrl-error" message={errors.articleUrl} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {copy.contact.message}
        <textarea
          name="message"
          rows={6}
          required
          defaultValue={values?.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message')}
          className={cn(input, 'h-auto resize-y py-3')}
        />
        <FieldError id="message-error" message={errors.message} />
      </label>

      {siteKey ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
        </>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-xs bg-ink px-7 text-[15px] font-semibold text-white hover:bg-[#2a2a33] disabled:opacity-70"
        >
          {pending ? copy.contact.sending : copy.contact.send}
        </button>
      </div>
    </form>
  )
}
