'use client'

import { useState } from 'react'

import {
  CheckIcon,
  FacebookIcon,
  LinkIcon,
  ShareIcon,
  WhatsAppIcon,
  XIcon,
} from '@/components/Icons'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/cn'

type Props = { url: string; title: string }

export function shareLinks({ url, title }: Props) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    x: `https://x.com/intent/post?text=${t}&url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  }
}

function useCopy(url: string) {
  const [copied, setCopied] = useState(false)
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt(copy.article.copyLink, url)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }
  return { copied, copyLink }
}

const round =
  'flex h-11 w-11 items-center justify-center rounded-full border border-rule bg-paper text-ink hover:text-green'

/** Desktop byline share: WhatsApp, X, Facebook, Copy link (44px round outline buttons). */
export function ShareButtons({ url, title }: Props) {
  const links = shareLinks({ url, title })
  const { copied, copyLink } = useCopy(url)
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-[13px] text-subtle">{copy.article.share}</span>
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={copy.article.shareOn('WhatsApp')}
        className={round}
      >
        <WhatsAppIcon />
      </a>
      <a
        href={links.x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={copy.article.shareOn('X')}
        className={round}
      >
        <XIcon />
      </a>
      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={copy.article.shareOn('Facebook')}
        className={round}
      >
        <FacebookIcon />
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? copy.article.copied : copy.article.copyLink}
        className={round}
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
      </button>
      <span role="status" className="sr-only">
        {copied ? copy.article.copied : ''}
      </span>
    </div>
  )
}

/** Phone byline: one share button using the native share sheet, falling back to copying the link. */
export function NativeShareButton({ url, title }: Props) {
  const { copied, copyLink } = useCopy(url)
  const share = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // Cancelled or unavailable: fall through to copying.
      }
    }
    await copyLink()
  }
  return (
    <>
      <button type="button" onClick={share} aria-label={copy.article.shareNative} className={round}>
        {copied ? <CheckIcon /> : <ShareIcon />}
      </button>
      <span role="status" className="sr-only">
        {copied ? copy.article.copied : ''}
      </span>
    </>
  )
}

/** Phone share row after the story: four labelled buttons. */
export function ShareRow({ url, title, className }: Props & { className?: string }) {
  const links = shareLinks({ url, title })
  const { copied, copyLink } = useCopy(url)
  const cell =
    'flex h-12 items-center justify-center border border-rule bg-paper text-xs font-semibold text-ink'
  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={cell}
        aria-label={copy.article.shareOn('WhatsApp')}
      >
        WhatsApp
      </a>
      <a
        href={links.x}
        target="_blank"
        rel="noopener noreferrer"
        className={cell}
        aria-label={copy.article.shareOn('X')}
      >
        X
      </a>
      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={cell}
        aria-label={copy.article.shareOn('Facebook')}
      >
        Facebook
      </a>
      <button type="button" onClick={copyLink} className={cell}>
        {copied ? copy.article.copied : copy.article.copyLink}
      </button>
    </div>
  )
}
