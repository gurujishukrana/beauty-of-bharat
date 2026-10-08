import { authorsOf, categoryOf } from '@/lib/cards'
import { renderOgImage } from '@/lib/og'
import { getArticleBySlug } from '@/lib/queries'
import { joinNames } from '@/lib/text'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticleBySlug((await params).slug)
  if (!article) return new Response('Not found', { status: 404 })
  return renderOgImage({
    kicker: categoryOf(article)?.name,
    title: article.title,
    footer: joinNames(authorsOf(article).map((p) => p.fullName)),
  })
}
