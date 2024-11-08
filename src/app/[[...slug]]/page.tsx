import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageContent } from '../../components/PageContent'
import { SCRAPBOX_INDEX_PAGE, SITE_NAME } from '../../lib/env'
import { getPage, searchTitle } from '../../lib/scrapbox'

export async function generateStaticParams(): Promise<
  {
    slug: string[]
  }[]
> {
  const pages = await searchTitle()

  return [
    { slug: [''] },
    ...pages.map((page) => ({
      slug: [page.title],
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
    <div>
      <h1>{page.title}</h1>
      <div>
        <PageContent text={text} />
      </div>
    </div>
  )
}
