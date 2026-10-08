import type { Metadata } from 'next'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArticleListItem } from '@/components/articles/ArticleListItem'
import { MostReadList } from '@/components/articles/MostReadList'
import { FeaturedStory } from '@/components/home/FeaturedStory'
import { NewsTipBand } from '@/components/home/NewsTipBand'
import { PeopleBand } from '@/components/home/PeopleBand'
import { LoadMore } from '@/components/LoadMore'
import { SectionHeader } from '@/components/SectionHeader'
import { toCard } from '@/lib/cards'
import { copy } from '@/lib/copy'
import { getHomeData } from '@/lib/queries'
import { routes } from '@/lib/url'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

/** "*emphasis*" in the CMS mission line becomes <em>. */
function MissionLine({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('*') && part.endsWith('*') ? (
          <em key={i} className="text-ink">
            {part.slice(1, -1)}
          </em>
        ) : (
          part
        ),
      )}
    </>
  )
}

export default async function HomePage() {
  const data = await getHomeData()
  const { settings } = data
  const featuredCard = data.featured ? toCard(data.featured) : null

  return (
    <>
      <h1 className="sr-only">{copy.siteName}</h1>

      <section className="container-site pt-5 sm:pt-9">
        <p className="max-w-[760px] font-serif text-[17px] leading-[1.4] text-body sm:text-[22px]">
          <MissionLine text={settings.missionLine} />
        </p>
      </section>

      {data.featured && featuredCard ? (
        <FeaturedStory
          article={data.featured}
          card={featuredCard}
          secondary={data.secondary.map(toCard)}
        />
      ) : (
        <section className="container-site py-14">
          <p className="text-body">{copy.news.empty}</p>
        </section>
      )}

      {data.latest.length > 0 && (
        <section className="container-site pb-6 sm:pb-16">
          <SectionHeader
            title={copy.home.latestNews}
            href={routes.news}
            linkLabel={copy.home.viewAllNews}
            mobileLinkLabel={copy.home.viewAll}
            className="mb-1 sm:mb-7"
          />
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] sm:gap-y-11">
            {data.latest.map((article, i) => (
              <div
                key={article.id}
                className={i === 0 ? 'max-sm:border-b max-sm:border-rule max-sm:py-5' : undefined}
              >
                <ArticleCard card={toCard(article)} compactOnMobile={i > 0} />
              </div>
            ))}
          </div>
          {data.hasMore && (
            <LoadMore
              exclude={data.excludeIds}
              fallbackHref={`${routes.news}?page=2`}
              limit={data.latest.length || 6}
            />
          )}
        </section>
      )}

      {(data.ground.length > 0 || data.mostRead.length > 0) && (
        <section className="container-site pb-10 sm:pb-[72px]">
          <div className="flex flex-wrap gap-10 sm:gap-12">
            {data.ground.length > 0 && (
              <div className="min-w-0 flex-[2_1_520px]">
                <SectionHeader
                  title={copy.home.groundReports}
                  size="md"
                  href={data.groundCategory ? routes.category(data.groundCategory.slug) : undefined}
                  linkLabel={data.groundCategory ? copy.home.viewAll : undefined}
                  className="mb-2"
                />
                {data.ground.map((article) => {
                  const card = toCard(article)
                  return (
                    <ArticleListItem
                      key={article.id}
                      card={card}
                      label={[data.groundCategory?.name ?? card.category, card.place]
                        .filter(Boolean)
                        .join(' · ')}
                    />
                  )
                })}
              </div>
            )}
            {data.mostRead.length > 0 && (
              <aside className="min-w-0 flex-[1_1_300px]" aria-labelledby="most-read-title">
                <div className="mb-2 border-t-2 border-ink pt-3.5 sm:pt-[18px]">
                  <h2
                    id="most-read-title"
                    className="font-serif text-[24px] font-medium sm:text-[28px]"
                  >
                    {copy.home.mostRead}
                  </h2>
                </div>
                <MostReadList cards={data.mostRead.map(toCard)} />
              </aside>
            )}
          </div>
        </section>
      )}

      {settings.homepage?.showPeopleBand !== false && <PeopleBand people={data.people} />}
      {settings.homepage?.showTipBand !== false && <NewsTipBand />}
    </>
  )
}
