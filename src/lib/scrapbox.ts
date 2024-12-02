import * as v from 'valibot'
import pkg from '../../package.json' assert { type: 'json' }
import {
  GetPageResponse,
  Page,
  PageMinimum,
  SearchTitleResponse,
} from '../schema/scrapbox'
import {
  SCRAPBOX_COLLECT_PAGE,
  SCRAPBOX_CONNECT_SID,
  SCRAPBOX_PROJECT,
} from './env'

const headers = {
  ...(SCRAPBOX_CONNECT_SID && {
    Cookie: `connect.sid=${SCRAPBOX_CONNECT_SID}`,
  }),
  'User-Agent': `${pkg.name}/${pkg.version}`,
} satisfies HeadersInit

let searchTitleCache: PageMinimum[] = []

export async function searchTitle(): Promise<PageMinimum[]> {
  if (searchTitleCache.length > 0) {
    return searchTitleCache
  }

  const pages: PageMinimum[] = []
  let followingId = ''
  do {
    const url = new URL(
      `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/search/titles`,
    )
    if (followingId) {
      url.searchParams.append('followingId', followingId)
    }

    const res = await fetch(url, { headers })
    const data = await v.parseAsync(SearchTitleResponse, await res.json())
    pages.push(...data.slice(followingId ? 1 : 0))

    followingId = res.headers.get('X-Following-Id') ?? ''
  } while (followingId)

  const p = pages
    .filter(
      (page) =>
        !SCRAPBOX_COLLECT_PAGE || page.links.includes(SCRAPBOX_COLLECT_PAGE),
    )
    .sort((a, b) => b.updated - a.updated)
    .map((p) => ({
      ...p,
      image: p.image?.startsWith('https://i.gyazo.com')
        ? p.image.replace(/\/raw$/, '')
        : p.image,
      links: new Set(p.links)
        .values()
        .filter((link) => link !== SCRAPBOX_COLLECT_PAGE)
        .map((link) => link.replaceAll('_', ' '))
        .toArray(),
    }))

  searchTitleCache = p

  return p
}

const getPageCache = new Map<string, Page>()

export async function getPage(title: string): Promise<Page | null> {
  const cached = getPageCache.get(title)
  if (cached) {
    return cached
  }

  const url = new URL(
    `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${title}`,
  )
  const res = await fetch(url, { headers })

  if (res.status === 404) {
    return null
  }

  const data = await v.parseAsync(GetPageResponse, await res.json())
  if ('message' in data) {
    throw new Error(data.message)
  }

  if (!data.persistent && data.relatedPages.links1hop.length === 0) {
    return null
  }

  data.lines = data.lines.map((line) => ({
    ...line,
    text: line.text
      .replaceAll(`#${SCRAPBOX_COLLECT_PAGE}`, '')
      .replaceAll(`[${SCRAPBOX_COLLECT_PAGE}]`, ''),
  }))
  data.links = data.links.filter((link) => link !== SCRAPBOX_COLLECT_PAGE)
  data.descriptions = data.descriptions
    .map((description) =>
      description
        .replaceAll(`#${SCRAPBOX_COLLECT_PAGE}`, '')
        .replaceAll(`[${SCRAPBOX_COLLECT_PAGE}]`, ''),
    )
    .filter((description) => description)
  data.image = data.image?.startsWith('https://i.gyazo.com')
    ? data.image.replace(/\/raw$/, '')
    : data.image

  getPageCache.set(title, data)

  return data
}
