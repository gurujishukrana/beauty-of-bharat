import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageBlocks } from '@/components/PageBlocks'
import { PreviewBar } from '@/components/PreviewBar'
import { copy } from '@/lib/copy'
import { getPageBySlug, pageMetadata } from '@/lib/pages'
import { routes } from '@/lib/url'

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getPageBySlug('about')
  return pageMetadata(page, routes.about, copy.nav.about)
}

export default async function AboutPage() {
  const { page, draft } = await getPageBySlug('about')
  if (!page) notFound()
  const hasHeading = page.layout.some((b) => b.blockType === 'statementHero')
  return (
    <>
      {draft && <PreviewBar path={routes.about} />}
      {!hasHeading && <h1 className="sr-only">{page.title}</h1>}
      <PageBlocks blocks={page.layout} />
    </>
  )
}
