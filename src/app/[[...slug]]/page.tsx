import { notFound } from 'next/navigation'
import { PageContent } from '../../components/PageContent'
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
