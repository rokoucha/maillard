import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import pkg from '../../package.json' assert { type: 'json' }
import { ArticleFooter } from '../components/ArticleFooter'
import { ArticleHeader } from '../components/ArticleHeader'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Main } from '../components/Main'
import { PageList } from '../components/PageList'
import { ScrapboxRenderer } from '../components/ScrapboxRenderer'
import { BASE_URL, SCRAPBOX_INDEX_PAGE, SITE_NAME } from '../lib/env'
import { descriptionsToText } from '../lib/renderer'
import { getPage, searchTitle } from '../lib/scrapbox'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(SCRAPBOX_INDEX_PAGE)
  if (!page) {
    notFound()
  }

  const description = descriptionsToText(page.descriptions)

  return {
    description,
    openGraph: {
      title: { absolute: SITE_NAME },
      description,
      images: page.image ?? undefined,
      modifiedTime: new Date(page.updated * 1000).toISOString(),
      publishedTime: new Date(page.created * 1000).toISOString(),
      tags: page.links,
      type: 'article',
      url: BASE_URL,
    },
    twitter: {
      title: { absolute: SITE_NAME },
      description,
    },
  }
}

export default async function Page(): Promise<React.ReactNode> {
  const page = await getPage(SCRAPBOX_INDEX_PAGE)
  if (!page) {
    notFound()
  }

  const text = page.lines.map((line) => line.text).join('\n')

  const pages = await searchTitle()

  const pagelists = pages.map((p) => ({
    date: new Date(p.updated * 1000),
    id: p.id,
    image: p.image ?? null,
    links: p.links,
    title: p.title,
  }))

  return (
    <>
      <Header siteName={SITE_NAME} logo={page.image ?? undefined} />
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
          <ArticleFooter hr={false}>
            <PageList pages={pagelists} />
          </ArticleFooter>
        </div>
      </Main>
      <Footer name={pkg.name} version={pkg.version} />
    </>
  )
}
