import { NextResponse } from 'next/server'
import { getPage, getPages } from '../../../lib/actions/cosense'
import {
  BASE_URL,
  SCRAPBOX_INDEX_PAGE,
  SITE_LANG,
  SITE_NAME,
} from '../../../lib/env'

export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const indexPage = await getPage(SCRAPBOX_INDEX_PAGE)
  if (!indexPage) {
    throw new Error('Index page not found')
  }

  const pages = await getPages()

  const baseUrl = new URL(BASE_URL)

  return NextResponse.json({
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_NAME,
    home_page_url: baseUrl.href,
    feed_url: `${baseUrl.href}/api/feed`,
    icon: indexPage.image,
    language: SITE_LANG,
    items: pages
      .sort((a, b) => b.updated.getTime() - a.updated.getTime())
      .map((page) => ({
        id: `tag:${baseUrl.hostname},2024-11-09:${page.id}`,
        url: `${process.env.BASE_URL}/${encodeURIComponent(page.title)}`,
        title: page.title,
        content_text: page.description,
        image: page.image,
        date_published: page.created.toISOString(),
        date_modified: page.updated.toISOString(),
        tags: page.links,
      })),
  })
}
