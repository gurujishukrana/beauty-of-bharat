import { renderOgImage } from '@/lib/og'
import { getPersonBySlug, getSiteSettings } from '@/lib/queries'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const [person, settings] = await Promise.all([
    getPersonBySlug((await params).slug),
    getSiteSettings(),
  ])
  if (!person) return new Response('Not found', { status: 404 })
  return renderOgImage({
    kicker: person.designation,
    title: person.fullName,
    footer: settings.showPressCardNumbers
      ? `Press card ${person.pressCardNumber}`
      : 'Press card holder',
  })
}
