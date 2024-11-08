import { type Metadata } from 'next'
import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants'
import { notFound } from 'next/navigation'
import pkg from '../../../package.json' assert { type: 'json' }
import { ArticleFooter } from '../../components/ArticleFooter'
import { ArticleHeader } from '../../components/ArticleHeader'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { Main } from '../../components/Main'
import { ScrapboxRenderer } from '../../components/ScrapboxRenderer'
import { SITE_NAME } from '../../lib/env'
import { getPage, searchTitle } from '../../lib/scrapbox'
import styles from './page.module.css'

export async function generateStaticParams(): Promise<
  {
    slug: string[]
  }[]
> {
  const pages = await searchTitle()

  return pages.map((page) => ({
    slug: [
      process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD
        ? page.title
        : encodeURIComponent(page.title),
    ],
  }))
}

type Props = Readonly<{
  params: Promise<{ slug: string[] }>
}>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = await params.then((p) => p.slug.join('/'))

  const page = await getPage(slug).catch((e) => {
    console.error(e)
    notFound()
  })

  return {
    title: page.title,
    description: page.descriptions.join('\n'),
    alternates: {
      types: {
        'application/feed+json': [
          {
            title: process.env.SITE_NAME,
            url: `/api/feed/${encodeURIComponent(page.title)}`,
          },
        ],
      },
    },
    icons: page.image,
    openGraph: {
      title: page.title,
      description: page.descriptions.join('\n'),
      images: page.image ?? undefined,
      modifiedTime: new Date(page.updated * 1000).toISOString(),
      publishedTime: new Date(page.created * 1000).toISOString(),
      tags: page.links,
      type: 'article',
      url: `${process.env.BASE_URL}/${encodeURIComponent(page.title)}`,
    },
    twitter: {
      title: page.title,
      description: page.descriptions.join('\n'),
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<React.ReactNode> {
  const slug = await params.then((p) => p.slug.join('/'))

  const page = await getPage(slug).catch((e) => {
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
