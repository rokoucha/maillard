import { type Metadata } from 'next'
import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants'
import { notFound } from 'next/navigation'
import pkg from '../../../package.json' assert { type: 'json' }
import { ArticleFooter } from '../../components/ArticleFooter'
import { ArticleHeader } from '../../components/ArticleHeader'
import { CosenseRenderer } from '../../components/CosenseRenderer'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { Main } from '../../components/Main'
import { PageList } from '../../components/PageList'
import { getPage, getPages } from '../../lib/actions/cosense'
import { SCRAPBOX_INDEX_PAGE, SITE_NAME } from '../../lib/env'
import styles from './page.module.css'

export async function generateStaticParams(): Promise<
  {
    slug: string[]
  }[]
> {
  const pages = await getPages()

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
  const slug = await params.then((p) => p.slug.join('/'))

  const page = await getPage(slug)
  if (!page) {
    notFound()
  }

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      images: page.image ?? undefined,
      modifiedTime: page.updated.toISOString(),
      publishedTime: page.created.toISOString(),
      tags: page.links,
      type: 'article',
      url: `${process.env.BASE_URL}/${encodeURIComponent(page.title)}`,
    },
    twitter: {
      title: page.title,
      description: page.description,
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

  const slug = await params.then((p) => p.slug.join('/'))

  const page = await getPage(slug)
  if (!page) {
    notFound()
  }

  const pageInfos = await getPages()
  const pageInfosMap = new Map(pageInfos.map((p) => [p.title, p]))

  return (
    <>
      <Header siteName={SITE_NAME} logo={indexPage.image ?? undefined} />
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
              pageInfos={pageInfosMap}
              title={page.title}
            />
          </section>
          <ArticleFooter hr={page.persistent}>
            {page.persistent && (
              <header>
                <h2 className={styles.title_text}>Related article</h2>
              </header>
            )}
            {page.relatedPages.length > 0 ? (
              <PageList pages={page.relatedPages} />
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
