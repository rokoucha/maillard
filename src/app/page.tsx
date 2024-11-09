import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import pkg from '../../package.json' assert { type: 'json' }
import { ArticleFooter } from '../components/ArticleFooter'
import { ArticleHeader } from '../components/ArticleHeader'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Main } from '../components/Main'
import { ScrapboxRenderer } from '../components/ScrapboxRenderer'
import { BASE_URL, SCRAPBOX_INDEX_PAGE, SITE_NAME } from '../lib/env'
import { getPage } from '../lib/scrapbox'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(SCRAPBOX_INDEX_PAGE).catch((e) => {
    console.error(e)
    notFound()
  })

  return {
    description: page.descriptions.join('\n'),
    alternates: {
      types: {
        'application/feed+json': [
          {
            title: SITE_NAME,
            url: `/api/feed`,
          },
        ],
      },
    },
    openGraph: {
      title: { absolute: SITE_NAME },
      description: page.descriptions.join('\n'),
      images: page.image ?? undefined,
      modifiedTime: new Date(page.updated * 1000).toISOString(),
      publishedTime: new Date(page.created * 1000).toISOString(),
      tags: page.links,
      type: 'article',
      url: BASE_URL,
    },
    twitter: {
      title: { absolute: SITE_NAME },
      description: page.descriptions.join('\n'),
    },
  }
}

export default async function Page(): Promise<React.ReactNode> {
  const page = await getPage(SCRAPBOX_INDEX_PAGE).catch((e) => {
    console.error(e)
    notFound()
  })

  const text = page.lines.map((line) => line.text).join('\n')

  return (
    <>
      <Header siteName={SITE_NAME} />
      <Main>
        <div className={styles.container}>
          <ArticleHeader
            createdAt={new Date(page.created * 1000)}
            title={page.title}
            updatedAt={new Date(page.updated * 1000)}
          />
          <section className={styles.main}>
            <ScrapboxRenderer text={text} />
          </section>
          <ArticleFooter
            persistent={page.persistent}
            relatedPages={page.relatedPages.links1hop}
          />
        </div>
      </Main>
      <Footer name={pkg.name} version={pkg.version} />
    </>
  )
}
