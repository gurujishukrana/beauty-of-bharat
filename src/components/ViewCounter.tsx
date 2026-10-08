'use client'

import { useEffect } from 'react'

/**
 * Optional "Most read" counter. Sends one anonymous beacon per page view: just the story's
 * slug. No cookies, no identifiers. Only rendered when Site settings → "Count views" is on.
 */
export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    if (navigator.doNotTrack === '1') return
    const body = JSON.stringify({ slug })
    if (!navigator.sendBeacon?.('/views', new Blob([body], { type: 'application/json' }))) {
      fetch('/views', {
        method: 'POST',
        body,
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {})
    }
  }, [slug])
  return null
}
