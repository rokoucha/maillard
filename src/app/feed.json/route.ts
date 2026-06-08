import { NextResponse } from 'next/server'
import { getPage, getPages } from '../../lib/actions/cosense'
import {
  BASE_URL,
  SCRAPBOX_INDEX_PAGE,
  SITE_LANG,
  SITE_NAME,
} from '../../lib/env'
import { buildJsonFeed } from '../../lib/feed'

export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const indexPage = await getPage(SCRAPBOX_INDEX_PAGE)
  if (!indexPage) {
    throw new Error('Index page not found')
  }

  const pages = await getPages()

  return NextResponse.json(
    buildJsonFeed({
      baseUrl: new URL(BASE_URL),
      indexPage,
      pages,
      siteLang: SITE_LANG,
      siteName: SITE_NAME,
    }),
    {
      headers: {
        'Content-Type': 'application/feed+json; charset=utf-8',
      },
    },
  )
}
