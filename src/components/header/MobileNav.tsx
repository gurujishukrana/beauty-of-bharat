'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CloseIcon, MenuIcon } from '@/components/Icons'
import { Logo } from '@/components/Logo'
import { TricolourRule } from '@/components/TricolourRule'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/cn'
import { routes } from '@/lib/url'

import { isActive, type NavLink } from './NavLinks'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Full-screen phone menu (MobileArticle.html, open state). Traps focus while open,
 * closes on Esc, locks page scroll, and returns focus to the menu button.
 */
export function MobileNav({ links, topics }: { links: NavLink[]; topics: { name: string; href: string }[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() ?? '/'
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const button = buttonRef.current

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      button?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={copy.nav.openMenu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center text-ink"
      >
        <MenuIcon />
      </button>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={copy.nav.mainLabel}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper sm:hidden"
        >
          <TricolourRule />
          <div className="flex items-center justify-between border-b border-rule py-2.5 pr-2 pl-4">
            <Logo height={22} className="h-[22px]" />
            <button
              type="button"
              aria-label={copy.nav.closeMenu}
              onClick={close}
              className="flex h-11 w-11 items-center justify-center text-ink"
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label={copy.nav.mainLabel} className="px-4 py-3">
            <ul>
              {links.map((link) => {
                const active = isActive(link.url, pathname)
                return (
                  <li key={link.url}>
                    <Link
                      href={link.url}
                      onClick={close}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'block border-b border-rule py-3.5 font-serif text-[30px] font-medium',
                        active ? 'text-green-text' : 'text-ink',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {topics.length > 0 && (
            <div className="flex flex-col gap-3 px-4 py-5">
              <h2 className="text-[11px] font-bold tracking-[0.08em] text-subtle uppercase">{copy.nav.topics}</h2>
              <ul className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <li key={topic.href}>
                    <Link
                      href={topic.href}
                      onClick={close}
                      className="block rounded-full border border-chip px-3.5 py-2.5 text-sm text-ink"
                    >
                      {topic.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href={routes.contact}
            onClick={close}
            className="mx-4 mt-2 mb-6 flex h-12 items-center justify-center rounded-xs bg-saffron text-[15px] font-bold text-ink hover:text-ink"
          >
            {copy.nav.sendTip}
          </Link>
        </div>
      )}
    </>
  )
}
