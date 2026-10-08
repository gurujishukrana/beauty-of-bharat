'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** Pages that use the full masthead (utility bar + category bar), as in Home.html. */
export function isFrontPage(pathname: string): boolean {
  return pathname === '/' || pathname === '/news' || pathname.startsWith('/category/')
}

/**
 * Story, people and info pages use the compact header from the design files
 * (strip + main bar); the front pages add the utility bar and category bar.
 */
export function HeaderChrome({
  utilityBar,
  mainBar,
  categoryBar,
}: {
  utilityBar: ReactNode
  mainBar: ReactNode
  categoryBar: ReactNode
}) {
  const full = isFrontPage(usePathname() ?? '/')
  return (
    <>
      {full && utilityBar}
      <div className={full ? 'max-sm:border-b max-sm:border-rule' : 'border-b border-rule'}>
        {mainBar}
      </div>
      {full && categoryBar}
    </>
  )
}
