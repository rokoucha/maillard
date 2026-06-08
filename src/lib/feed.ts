import type { PageResponse, RelatedPageResponse } from './presentation/page'

export type JsonFeed = {
  version: 'https://jsonfeed.org/version/1.1'
  title: string
  home_page_url: string
  feed_url: string
  icon: string | null
  language: string | undefined
  items: JsonFeedItem[]
}

export type JsonFeedItem = {
  id: string
  url: string
  title: string
  content_text: string
  image: string | null
  date_published: string
  date_modified: string
  tags: string[]
}

type FeedOptions = {
  baseUrl: URL
  indexPage: PageResponse
  pages: RelatedPageResponse[]
  siteLang: string | undefined
  siteName: string
}

export function buildJsonFeed({
  baseUrl,
  indexPage,
  pages,
  siteLang,
  siteName,
}: FeedOptions): JsonFeed {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: siteName,
    home_page_url: baseUrl.href,
    feed_url: new URL('feed.json', baseUrl).href,
    icon: indexPage.image,
    language: siteLang,
    items: sortedByUpdatedDesc(pages).map((page) => ({
      id: pageTagUri(baseUrl, page),
      url: pageUrl(baseUrl, page),
      title: page.title,
      content_text: page.description,
      image: page.image,
      date_published: page.created.toISOString(),
      date_modified: page.updated.toISOString(),
      tags: page.links,
    })),
  }
}

export function buildAtomFeed({
  baseUrl,
  indexPage,
  pages,
  siteName,
}: FeedOptions): string {
  const feedUrl = new URL('feed.atom', baseUrl).href
  const updated =
    sortedByUpdatedDesc(pages)[0]?.updated.toISOString() ??
    indexPage.updated.toISOString()
  const icon = indexPage.image
    ? `  <icon>${escapeXml(indexPage.image)}</icon>`
    : ''

  const entries = sortedByUpdatedDesc(pages)
    .map(
      (page) => `  <entry>
    <id>${escapeXml(pageTagUri(baseUrl, page))}</id>
    <title>${escapeXml(page.title)}</title>
    <updated>${page.updated.toISOString()}</updated>
    <published>${page.created.toISOString()}</published>
    <link rel="alternate" href="${escapeXml(pageUrl(baseUrl, page))}" />
    <summary type="text">${escapeXml(page.description)}</summary>
  </entry>`,
    )
    .join('\n')

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <id>${escapeXml(baseUrl.href)}</id>`,
    `  <title>${escapeXml(siteName)}</title>`,
    `  <updated>${updated}</updated>`,
    `  <link rel="alternate" href="${escapeXml(baseUrl.href)}" />`,
    `  <link rel="self" href="${escapeXml(feedUrl)}" />`,
    icon,
    entries,
    '</feed>',
  ]
    .filter((line) => line !== '')
    .join('\n')
}

function sortedByUpdatedDesc(
  pages: RelatedPageResponse[],
): RelatedPageResponse[] {
  return [...pages].sort((a, b) => b.updated.getTime() - a.updated.getTime())
}

function pageTagUri(baseUrl: URL, page: RelatedPageResponse): string {
  return `tag:${baseUrl.hostname},2024-11-09:${page.id}`
}

function pageUrl(baseUrl: URL, page: RelatedPageResponse): string {
  return new URL(page.escapedTitle, baseUrl).href
}

function escapeXml(value: string): string {
  return value.replaceAll(/[<>&"']/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case '"':
        return '&quot;'
      case "'":
        return '&apos;'
      default:
        return char
    }
  })
}
