import { renderOgImage } from '@/lib/og'
import { getPersonBySlug } from '@/lib/queries'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const person = await getPersonBySlug((await params).slug)
  if (!person) return new Response('Not found', { status: 404 })
  return renderOgImage({
    kicker: person.designation,
    title: person.fullName,
    footer: `Press card ${person.pressCardNumber}`,
  })
}
