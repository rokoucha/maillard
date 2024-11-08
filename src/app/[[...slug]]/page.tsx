import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleFooter } from '../../components/ArticleFooter'
import { ArticleHeader } from '../../components/ArticleHeader'
import { ScrapboxRenderer } from '../../components/ScrapboxRenderer'
import { SCRAPBOX_INDEX_PAGE, SITE_NAME } from '../../lib/env'
import { getPage, searchTitle } from '../../lib/scrapbox'
import styles from './page.module.css'

export async function generateStaticParams(): Promise<
  {
    slug: string[]
  }[]
> {
  const pages = await searchTitle()

  return [
    { slug: [''] },
    ...pages.map((page) => ({
      slug: [encodeURIComponent(page.title)],
    })),
  ]
}

type Props = Readonly<{
  params: Promise<{ slug: string }>
}>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = await params.then((p) => p.slug)

  const page = await getPage(slug).catch((e) => {
    console.error(e)
    notFound()
  })

  const title = page.title === SCRAPBOX_INDEX_PAGE ? '' : page.title

  return {
    ...(title && { title: page.title }),
    description: page.descriptions.join('\n'),
    alternates: {
      types: {
        'application/feed+json': [
          {
            title: process.env.SITE_NAME,
            url: `/api/feed/${encodeURIComponent(title)}`,
          },
        ],
      },
    },
    icons: page.image,
    openGraph: {
      title: title ? title : { absolute: SITE_NAME },
      description: page.descriptions.join('\n'),
      images: page.image ?? undefined,
      modifiedTime: new Date(page.updated * 1000).toISOString(),
      publishedTime: new Date(page.created * 1000).toISOString(),
      tags: page.links,
      type: 'article',
      url: `${process.env.BASE_URL}/${encodeURIComponent(title)}`,
    },
    twitter: {
      title: title ? title : { absolute: SITE_NAME },
      description: page.descriptions.join('\n'),
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<React.ReactNode> {
  const slug = await params.then((p) => p.slug)

  const page = await getPage(slug).catch((e) => {
    console.error(e)
    notFound()
  })

  const text = page.lines.map((line) => line.text).join('\n')

  return (
    <div className={styles.container}>
      <ArticleHeader
        createdAt={new Date(page.created * 1000)}
        title={page.title}
        updatedAt={new Date(page.updated * 1000)}
      />
      <section>
        <ScrapboxRenderer text={text} />
      </section>
      <ArticleFooter
        persistent={page.persistent}
        relatedPages={page.relatedPages.links1hop}
      />
    </div>
  )
}
