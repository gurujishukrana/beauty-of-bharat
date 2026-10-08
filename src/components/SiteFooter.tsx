import Link from 'next/link'

import { SOCIAL_LABELS } from '@/components/Icons'
import { Logo } from '@/components/Logo'
import { TricolourRule } from '@/components/TricolourRule'
import { DEFAULT_HEADER_LINKS, DEFAULT_LEGAL_LINKS } from '@/globals/Navigation'
import { copy } from '@/lib/copy'
import { getNavigation, getSiteSettings } from '@/lib/queries'

type FooterLink = { label: string; url: string; external?: boolean }

export async function SiteFooter() {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()])
  const year = new Date().getFullYear()

  const sections = navigation.footerSections?.length
    ? navigation.footerSections
    : DEFAULT_HEADER_LINKS
  const legal = navigation.footerLegal?.length ? navigation.footerLegal : DEFAULT_LEGAL_LINKS
  const follow: FooterLink[] = (settings.socialLinks ?? []).map((s) => ({
    label: SOCIAL_LABELS[s.platform],
    url: s.url,
    external: true,
  }))

  const columns: { title: string; links: FooterLink[] }[] = [
    { title: copy.footer.sections, links: sections },
    ...(follow.length ? [{ title: copy.footer.follow, links: follow }] : []),
    { title: copy.footer.legal, links: legal },
  ]

  return (
    <footer className="bg-footer text-footer-text">
      <div className="container-site pt-8 pb-8 sm:pt-16">
        <div className="flex flex-wrap justify-between gap-8 sm:gap-12">
          <div className="flex max-w-[380px] flex-[1_1_320px] flex-col gap-[18px]">
            <Logo tone="white" height={30} className="h-[22px] self-start sm:h-[30px]" />
            <p className="m-0 text-sm leading-[1.6] sm:text-[15px]">{settings.tagline}</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-x-6 gap-y-8 text-sm sm:flex sm:w-auto sm:flex-wrap sm:gap-16">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="mb-4 text-sm font-semibold text-white">{column.title}</h2>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={`${link.label}-${link.url}`}>
                      {link.external || /^https?:/.test(link.url) ? (
                        <a
                          href={link.url}
                          rel="me noopener"
                          className="text-footer-text hover:text-white"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.url} className="text-footer-text hover:text-white">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <TricolourRule variant="footer" className="mt-10 mb-5 sm:mt-12" />
        <div className="flex flex-wrap justify-between gap-3 text-xs text-footer-small sm:text-[13px]">
          <span>{copy.footer.rights(year)}</span>
          <span>{copy.domain}</span>
        </div>
      </div>
    </footer>
  )
}
