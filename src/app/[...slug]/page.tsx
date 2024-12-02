import { type Metadata } from 'next'
import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants'
import { notFound } from 'next/navigation'
import pkg from '../../../package.json' assert { type: 'json' }
import { ArticleFooter } from '../../components/ArticleFooter'
import { ArticleHeader } from '../../components/ArticleHeader'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { Main } from '../../components/Main'
import { PageList } from '../../components/PageList'
import { ScrapboxRenderer } from '../../components/ScrapboxRenderer'
import { SCRAPBOX_INDEX_PAGE, SITE_NAME } from '../../lib/env'
import { descriptionsToText } from '../../lib/renderer'
import { getPage, searchTitle } from '../../lib/scrapbox'
import styles from './page.module.css'

export async function generateStaticParams(): Promise<
  {
    slug: string[]
  }[]
> {
  const pages = await searchTitle()

  return pages.map((page) => ({
    slug:
      process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD
        ? page.title.split('/')
        : [
            page.title
              .split('/')
              .map((p) => encodeURIComponent(p))
              .join('/'),
          ],
  }))
}

type Props = Readonly<{
  params: Promise<{ slug: string[] }>
}>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = await params.then((p) => p.slug.join('%2F'))

  const page = await getPage(slug)
  if (!page) {
    notFound()
  }

  const description = descriptionsToText(page.descriptions)

  return {
    title: page.title,
    description,
    openGraph: {
      title: page.title,
      description,
      images: page.image ?? undefined,
      modifiedTime: new Date(page.updated * 1000).toISOString(),
      publishedTime: new Date(page.created * 1000).toISOString(),
      tags: page.links,
      type: 'article',
      url: `${process.env.BASE_URL}/${encodeURIComponent(page.title)}`,
    },
    twitter: {
      title: page.title,
      description,
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<React.ReactNode> {
  const indexPage = await getPage(SCRAPBOX_INDEX_PAGE)
  if (!indexPage) {
    throw new Error('Index page not found')
  }

  const slug = await params.then((p) => p.slug.join('%2F'))

  const page = await getPage(slug)
  if (!page) {
    notFound()
  }

  const text = page.lines.map((line) => line.text).join('\n')

  const pages = await searchTitle()

  const pagesMap = new Map(pages.map((p) => [p.title, p]))

  const relatedPages = [
    ...page.relatedPages.links1hop,
    ...page.relatedPages.links2hop,
  ].map((l) => {
    const p = pagesMap.get(l.title)
    if (!p) {
      throw new Error(`Page not found: ${l.title}`)
    }

    return {
      date: new Date(p.updated * 1000),
      id: p.id,
      image: p.image ?? null,
      links: p.links,
      title: p.title,
    }
  })

  return (
    <>
      <Header siteName={SITE_NAME} logo={indexPage.image ?? undefined} />
      <Main>
        <div className={styles.container}>
          <ArticleHeader
            createdAt={new Date(page.created * 1000)}
            title={page.title}
            updatedAt={new Date(page.updated * 1000)}
          />
          <section className={styles.main}>
            <ScrapboxRenderer text={text} title={page.title} pages={pages} />
          </section>
          <ArticleFooter hr={page.persistent}>
            {page.persistent && (
              <header>
                <h2 className={styles.title_text}>Related article</h2>
              </header>
            )}
            {relatedPages.length > 0 ? (
              <PageList pages={relatedPages} />
            ) : (
              <section>
                <p>There is no related pages.</p>
              </section>
            )}
          </ArticleFooter>
        </div>
      </Main>
      <Footer name={pkg.name} version={pkg.version} />
    </>
  )
}
