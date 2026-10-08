import type { Metadata } from 'next'

import { ContactForm } from '@/components/contact/ContactForm'
import { SOCIAL_ICONS, SOCIAL_LABELS, WhatsAppIcon } from '@/components/Icons'
import { topicFromParam } from '@/lib/contact'
import { copy } from '@/lib/copy'
import { getSiteSettings } from '@/lib/queries'
import { routes, whatsappLink } from '@/lib/url'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Send a news tip, a press enquiry or a correction to Beauty of Bharat.',
  alternates: { canonical: routes.contact },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const DESK_BARS = ['bg-saffron', 'bg-navy', 'bg-green', 'bg-ink']

export default async function ContactPage({ searchParams }: Props) {
  const [sp, settings] = await Promise.all([searchParams, getSiteSettings()])
  const article = Array.isArray(sp.article) ? sp.article[0] : sp.article
  const desks = settings.contactEmails
  const deskList = [
    { title: 'News tips', email: desks?.tips, text: desks?.tipsText },
    { title: 'Press enquiries', email: desks?.press, text: desks?.pressText },
    { title: 'General enquiries', email: desks?.general, text: desks?.generalText },
    { title: 'Corrections', email: desks?.corrections, text: desks?.correctionsText },
  ]
  const wa = whatsappLink(settings.whatsappNumber)
  const socials = settings.socialLinks ?? []

  return (
    <>
      <section className="container-site flex flex-col gap-4 pt-10 pb-8 sm:gap-[18px] sm:pt-[72px] sm:pb-10">
        <p className="kicker sm:text-xs">{copy.contact.kicker}</p>
        <h1 className="font-serif text-[36px] leading-[1.04] font-medium tracking-[-0.015em] sm:text-[60px]">
          Get in touch
        </h1>
        {settings.contactIntro ? (
          <p className="max-w-[620px] text-[17px] leading-[1.6] text-body sm:text-lg">
            {settings.contactIntro}
          </p>
        ) : null}
      </section>

      <section className="container-site pb-12 sm:pb-16">
        <ul className="grid grid-cols-1 border-t-2 border-ink sm:grid-cols-[repeat(auto-fill,minmax(270px,1fr))]">
          {deskList.map((desk, i) => (
            <li key={desk.title} className="flex flex-col gap-2.5 border-b border-rule py-7 pr-7">
              <span aria-hidden="true" className={`block h-[3px] w-9 ${DESK_BARS[i]}`} />
              <h2 className="mt-1.5 font-serif text-[26px] font-medium">{desk.title}</h2>
              {desk.text ? (
                <p className="text-[15px] leading-[1.55] text-muted">{desk.text}</p>
              ) : null}
              {desk.email ? (
                <a
                  href={`mailto:${desk.email}`}
                  className="mt-1 text-[15px] font-semibold break-all text-green-text"
                >
                  {desk.email}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="container-site flex flex-wrap items-start gap-10 pb-16 sm:gap-14 sm:pb-[88px]">
        <div className="relative min-w-0 flex-[2_1_520px]">
          <ContactForm
            initialTopic={topicFromParam(sp.topic)}
            initialArticle={article?.slice(0, 500) ?? ''}
          />
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          <div className="flex flex-col gap-3 bg-sand p-7">
            <div className="flex items-center gap-2.5">
              <WhatsAppIcon size={22} className="text-green-text" />
              <h2 className="text-[17px] font-bold">{copy.contact.whatsapp}</h2>
            </div>
            <p className="text-[15px] leading-[1.55] text-muted">{copy.contact.whatsappText}</p>
            {wa ? (
              <a href={wa} className="text-base font-semibold text-ink" rel="noopener">
                {settings.whatsappNumber}
              </a>
            ) : (
              <span className="text-base font-semibold">{settings.whatsappNumber}</span>
            )}
          </div>
          {socials.length > 0 && (
            <div className="flex flex-col gap-3.5 border border-rule p-7">
              <h2 className="text-[17px] font-bold">{copy.contact.follow}</h2>
              <ul className="flex flex-col gap-1 text-[15px]">
                {socials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.platform]
                  return (
                    <li key={s.id ?? s.url}>
                      <a
                        href={s.url}
                        rel="me noopener"
                        className="flex min-h-11 items-center gap-2.5 text-ink"
                      >
                        <Icon size={18} />
                        {SOCIAL_LABELS[s.platform]}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </>
  )
}
