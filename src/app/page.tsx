import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import pkg from '../../package.json' assert { type: 'json' }
import { ArticleFooter } from '../components/ArticleFooter'
import { ArticleHeader } from '../components/ArticleHeader'
import { CosenseRenderer } from '../components/CosenseRenderer'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Main } from '../components/Main'
import { PageList } from '../components/PageList'
import { fetchPage, fetchPageInfos, fetchPages } from '../lib/cosense'
import { BASE_URL, SCRAPBOX_INDEX_PAGE, SITE_NAME } from '../lib/env'
import { RelatedPage } from '../schema/cosense'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage(SCRAPBOX_INDEX_PAGE)
  if (!page) {
    notFound()
  }

  return {
    description: page.description,
    openGraph: {
      title: { absolute: SITE_NAME },
      description: page.description,
      images: page.image ?? undefined,
      modifiedTime: page.updated.toISOString(),
      publishedTime: page.created.toISOString(),
      tags: page.links,
      type: 'article',
      url: BASE_URL,
    },
    twitter: {
      title: { absolute: SITE_NAME },
      description: page.description,
    },
  }
}

export default async function Page(): Promise<React.ReactNode> {
  const page = await fetchPage(SCRAPBOX_INDEX_PAGE)
  if (!page) {
    notFound()
  }

  const pageInfos = await fetchPageInfos()
  const pageInfosMap = new Map(pageInfos.map((p) => [p.title, p]))

  const pagelists = await fetchPages().then((pages) =>
    pages.map(
      (page): RelatedPage => ({
        id: page.id,
        title: page.title,
        image: page.image,
        description: page.description,
        created: page.created,
        updated: page.updated,
        links: page.links,
      }),
    ),
  )

  return (
    <>
      <Header siteName={SITE_NAME} logo={page.image ?? undefined} />
      <Main>
        <div className={styles.container}>
          <ArticleHeader
            createdAt={page.created}
            title={page.title}
            updatedAt={page.updated}
          />
          <section className={styles.main}>
            <CosenseRenderer
              blocks={page.blocks}
              title={page.title}
              pageInfos={pageInfosMap}
            />
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
