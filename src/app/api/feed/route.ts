import { NextResponse } from 'next/server'
import {
  BASE_URL,
  SCRAPBOX_INDEX_PAGE,
  SITE_LANG,
  SITE_NAME,
} from '../../../lib/env'
import { getPage, searchTitle } from '../../../lib/scrapbox'

export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const indexPage = await getPage(SCRAPBOX_INDEX_PAGE)
  if (!indexPage) {
    throw new Error('Index page not found')
  }

  const pages = await searchTitle()

  const baseUrl = new URL(BASE_URL)

  return NextResponse.json({
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_NAME,
    home_page_url: baseUrl.href,
    feed_url: `${baseUrl.href}/api/feed`,
    icon: indexPage.image,
    language: SITE_LANG,
    items: pages.map((page) => ({
      id: `tag:${baseUrl.hostname},2024-11-09:${page.id}`,
      url: `${process.env.BASE_URL}/${encodeURIComponent(page.title)}`,
      title: page.title,
      content_text: page.links.join(' '),
      image: page.image,
      date_modified: new Date(page.updated * 1000).toISOString(),
      tags: page.links,
    })),
  })
}
