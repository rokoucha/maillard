import { getPage, getPages } from '../../lib/actions/cosense'
import { BASE_URL, SCRAPBOX_INDEX_PAGE, SITE_NAME } from '../../lib/env'
import { buildAtomFeed } from '../../lib/feed'

export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const indexPage = await getPage(SCRAPBOX_INDEX_PAGE)
  if (!indexPage) {
    throw new Error('Index page not found')
  }

  const pages = await getPages()

  return new Response(
    buildAtomFeed({
      baseUrl: new URL(BASE_URL),
      indexPage,
      pages,
      siteLang: undefined,
      siteName: SITE_NAME,
    }),
    {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
      },
    },
  )
}
