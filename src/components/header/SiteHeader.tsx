import Link from 'next/link'

import { SearchIcon, SOCIAL_ICONS, SOCIAL_LABELS } from '@/components/Icons'
import { Logo } from '@/components/Logo'
import { TricolourRule } from '@/components/TricolourRule'
import { DEFAULT_HEADER_LINKS } from '@/globals/Navigation'
import { copy } from '@/lib/copy'
import { formatLongDate } from '@/lib/dates'
import { getCategories, getNavigation, getSiteSettings } from '@/lib/queries'
import { routes } from '@/lib/url'

import { CategoryBar } from './CategoryBar'
import { HeaderChrome } from './HeaderChrome'
import { MobileNav } from './MobileNav'
import { NavLinks } from './NavLinks'

const UTILITY_SOCIALS = ['instagram', 'youtube', 'whatsapp', 'x', 'facebook'] as const

export async function SiteHeader() {
  const [settings, navigation, categories] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getCategories(),
  ])
  const links = navigation.header?.length ? navigation.header : DEFAULT_HEADER_LINKS
  const barCategories = categories
    .filter((c) => c.showInCategoryBar)
    .map((c) => ({ name: c.name, href: routes.category(c.slug) }))
  const socials = (settings.socialLinks ?? []).filter((s) =>
    (UTILITY_SOCIALS as readonly string[]).includes(s.platform),
  )

  const utilityBar = (
    <div className="hidden border-b border-rule sm:block">
      <div className="container-site flex items-center justify-between py-2.5 text-[13px] text-subtle">
        <span>{formatLongDate(new Date())}</span>
        <div className="flex items-center gap-5">
          <span>{settings.utilityBarText}</span>
          {socials.length > 0 && (
            <ul className="flex items-center gap-3.5">
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform]
                return (
                  <li key={s.id ?? s.url}>
                    <a
                      href={s.url}
                      aria-label={SOCIAL_LABELS[s.platform]}
                      className="flex text-subtle hover:text-green"
                      rel="me noopener"
                    >
                      <Icon size={s.platform === 'youtube' ? 18 : 16} />
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )

  const mainBar = (
    <div className="container-site flex items-center justify-between gap-6 py-2.5 pr-2 sm:py-[22px] sm:pr-[clamp(16px,4vw,40px)]">
      <Link href="/" aria-label={copy.nav.homeLink} className="flex shrink-0">
        <Logo height={34} className="h-[22px] sm:h-[34px]" alt="Beauty of Bharat" />
      </Link>
      <div className="hidden items-center gap-8 sm:flex">
        <NavLinks links={links.map(({ label, url }) => ({ label, url }))} />
        <SearchButton bordered />
      </div>
      <div className="flex items-center sm:hidden">
        <SearchButton />
        <MobileNav links={links.map(({ label, url }) => ({ label, url }))} topics={barCategories} />
      </div>
    </div>
  )

  return (
    <header>
      <TricolourRule />
      <HeaderChrome utilityBar={utilityBar} mainBar={mainBar} categoryBar={<CategoryBar categories={barCategories} />} />
    </header>
  )
}

function SearchButton({ bordered }: { bordered?: boolean }) {
  return (
    <Link
      href={routes.search}
      aria-label={copy.nav.search}
      className={
        bordered
          ? 'flex h-11 w-11 items-center justify-center rounded-full border border-rule bg-paper text-ink hover:text-green'
          : 'flex h-11 w-11 items-center justify-center text-ink'
      }
    >
      <SearchIcon size={bordered ? 18 : 20} />
    </Link>
  )
}
