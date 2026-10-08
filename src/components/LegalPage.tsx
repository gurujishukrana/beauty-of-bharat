import { notFound } from 'next/navigation'

import { PageBlocks } from '@/components/PageBlocks'
import { PreviewBar } from '@/components/PreviewBar'
import { formatDate } from '@/lib/dates'
import { getPageBySlug } from '@/lib/pages'

/** Privacy / Terms: title over the 700px article-style column. */
export async function LegalPage({ slug }: { slug: string }) {
  const { page, draft } = await getPageBySlug(slug)
  if (!page) notFound()
  return (
    <>
      {draft && <PreviewBar path={`/${slug}`} />}
      <header className="mx-auto flex max-w-[700px] flex-col gap-3 px-4 pt-10 pb-6 sm:box-content sm:px-10 sm:pt-16 sm:pb-10">
        <h1 className="font-serif text-[36px] leading-[1.06] font-medium tracking-[-0.015em] sm:text-[52px]">
          {page.title}
        </h1>
        <p className="text-[13px] text-subtle">
          Last updated <time dateTime={page.updatedAt}>{formatDate(page.updatedAt)}</time>
        </p>
      </header>
      <PageBlocks blocks={page.layout} />
    </>
  )
}
