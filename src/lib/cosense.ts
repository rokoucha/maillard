import { CodeBlock, Table } from '@progfay/scrapbox-parser'
import * as v from 'valibot'
import pkg from '../../package.json' assert { type: 'json' }
import {
  GetPage,
  GetPageResponse,
  Page,
  PageInfo,
  RelatedPage,
  SearchTitlePage,
  SearchTitleResponse,
} from '../schema/cosense'
import {
  SCRAPBOX_COLLECT_PAGE,
  SCRAPBOX_CONNECT_SID,
  SCRAPBOX_PROJECT,
} from './env'
import { descriptionsToText, parse } from './parser'

const headers = {
  ...(SCRAPBOX_CONNECT_SID && {
    Cookie: `connect.sid=${SCRAPBOX_CONNECT_SID}`,
  }),
  'User-Agent': `${pkg.name}/${pkg.version}`,
} satisfies HeadersInit

let searchTitleCache: SearchTitlePage[] = []

async function searchTitle(): Promise<SearchTitlePage[]> {
  if (searchTitleCache.length > 0) {
    return searchTitleCache
  }

  const pages: SearchTitlePage[] = []
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
    if ('message' in data) {
      throw new Error(data.message)
    }
    pages.push(...data.slice(followingId ? 1 : 0))

    followingId = res.headers.get('X-Following-Id') ?? ''
  } while (followingId)

  searchTitleCache = pages

  return pages
}

const getPageCache = new Map<string, GetPage>()

async function getPage(title: string): Promise<GetPage | null> {
  const cached = getPageCache.get(title)
  if (cached) {
    return cached
  }

  const url = new URL(
    `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${title.replaceAll('/', '%2F')}`,
  )
  const res = await fetch(url, { headers })

  if (res.status === 404) {
    return null
  }

  const data = await v.parseAsync(GetPageResponse, await res.json())
  if ('message' in data) {
    throw new Error(data.message)
  }

  getPageCache.set(title, data)

  return data
}

let pageTitleCache: PageInfo[] = []

export async function fetchPageInfos(): Promise<PageInfo[]> {
  if (pageTitleCache.length > 0) {
    return pageTitleCache
  }

  const pages = await searchTitle()
  const infos = pages
    .map((p) => ({
      id: p.id,
      title: p.title,
      links: p.links,
      updated: new Date(p.updated * 1000),
      image: p.image ?? null,
    }))
    .filter(
      (t) =>
        t.title !== SCRAPBOX_COLLECT_PAGE ||
        (SCRAPBOX_COLLECT_PAGE && t.links.includes(SCRAPBOX_COLLECT_PAGE)),
    )

  pageTitleCache = infos

  return infos
}

const pageCache = new Map<string, Page>()

export async function fetchPage(title: string): Promise<Page | null> {
  const cache = pageCache.get(title)
  if (cache) {
    return cache
  }

  const page = await getPage(title)
  if (!page) {
    return null
  }

  const relatedPages: RelatedPage[] = []
  for (const link of [
    ...page.relatedPages.links1hop,
    ...page.relatedPages.links2hop,
  ]) {
    const related = await getPage(link.title)
    if (!related) {
      throw new Error(`Page not found: ${link.title}`)
    }

    if (
      related.title === SCRAPBOX_COLLECT_PAGE ||
      (SCRAPBOX_COLLECT_PAGE && !related.links.includes(SCRAPBOX_COLLECT_PAGE))
    ) {
      continue
    }

    relatedPages.push({
      id: related.id,
      title: related.title,
      image: related.image,
      description: descriptionsToText(related.descriptions),
      created: new Date(related.created * 1000),
      updated: new Date(related.updated * 1000),
      links: related.links.filter((l) => l !== SCRAPBOX_COLLECT_PAGE),
    })
  }

  return {
    id: page.id,
    title: page.title,
    image: page.image,
    description: descriptionsToText(page.descriptions),
    pin: page.pin === 1,
    created: new Date(page.created * 1000),
    updated: new Date(page.updated * 1000),
    persistent: page.persistent,
    blocks: parse(page.lines.map((l) => l.text).join('\n')),
    links: page.links.filter((l) => l !== SCRAPBOX_COLLECT_PAGE),
    icons: page.icons,
    files: page.files,
    relatedPages,
    externalLinks: page.relatedPages.projectLinks1hop.map((l) => ({
      id: l.id,
      title: l.title,
      image: l.image,
      description: descriptionsToText(l.descriptions),
      updated: new Date(l.updated * 1000),
    })),
  }
}

export async function fetchPages(): Promise<Page[]> {
  const infos = await fetchPageInfos()
  const pages: Page[] = []
  for (const info of infos) {
    const page = await fetchPage(info.title)
    if (page) {
      pages.push(page)
    }
  }

  return pages
}

export async function fetchCodes(): Promise<
  { pagetitle: string; filename: string }[]
> {
  const pages = await fetchPages()

  return pages.flatMap((p) =>
    p.blocks
      .filter((b): b is CodeBlock => b.type === 'codeBlock')
      .map((b) => ({
        pagetitle: p.title,
        filename: b.fileName,
      })),
  )
}

export async function fetchTables(): Promise<
  { pagetitle: string; filename: string }[]
> {
  const pages = await fetchPages()

  return pages.flatMap((p) =>
    p.blocks
      .filter((b): b is Table => b.type === 'table')
      .map((b) => ({
        pagetitle: p.title,
        filename: `${b.fileName}.csv`,
      })),
  )
}
