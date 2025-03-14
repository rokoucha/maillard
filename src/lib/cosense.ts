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
  SCRAPBOX_API_URL,
  SCRAPBOX_COLLECT_PAGE,
  SCRAPBOX_CONNECT_SID,
  SCRAPBOX_INDEX_PAGE,
  SCRAPBOX_PROJECT,
} from './env'
import { descriptionsToText, parse } from './parser'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const WAIT_CACHE_MS = 1000

const headers = {
  ...(SCRAPBOX_CONNECT_SID && {
    Cookie: `connect.sid=${SCRAPBOX_CONNECT_SID}`,
  }),
  'User-Agent': `${pkg.name}/${pkg.version}`,
} satisfies HeadersInit

async function searchTitle(): Promise<SearchTitlePage[]> {
  const pages: SearchTitlePage[] = []
  let followingId = ''
  do {
    const url = new URL(
      `${SCRAPBOX_API_URL}/pages/${SCRAPBOX_PROJECT}/search/titles`,
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

  return pages
}

async function getPage(title: string): Promise<GetPage | null> {
  const url = new URL(
    `${SCRAPBOX_API_URL}/pages/${SCRAPBOX_PROJECT}/${title.replaceAll('/', '%2F')}`,
  )
  const res = await fetch(url, { headers })

  if (res.status === 404) {
    return null
  }

  const data = await v.parseAsync(GetPageResponse, await res.json())
  if ('message' in data) {
    throw new Error(data.message)
  }

  return data
}

export async function fetchPageInfos(): Promise<PageInfo[]> {
  const pages = await searchTitle()
  const infos = pages
    .map((p) => ({
      id: p.id,
      title: p.title,
      links: p.links,
      updated: new Date(p.updated * 1000),
      image: p.image ?? null,
    }))
    .filter((t) =>
      SCRAPBOX_COLLECT_PAGE
        ? (SCRAPBOX_COLLECT_PAGE !== SCRAPBOX_INDEX_PAGE
            ? SCRAPBOX_COLLECT_PAGE !== t.title
            : true) &&
          (SCRAPBOX_INDEX_PAGE === t.title ||
            t.links.includes(SCRAPBOX_COLLECT_PAGE))
        : true,
    )

  return infos.sort((a, b) => b.updated.getTime() - a.updated.getTime())
}

export async function fetchPage(title: string): Promise<Page | null> {
  const page = await getPage(title)
  if (!page) {
    return null
  }

  if (
    SCRAPBOX_COLLECT_PAGE &&
    page.title !== SCRAPBOX_COLLECT_PAGE &&
    !page.links.includes(SCRAPBOX_COLLECT_PAGE)
  ) {
    return null
  }

  const infos = await fetchPageInfos()
  const infosMap = new Map(infos.map((i) => [i.title, i]))

  const links: string[] = []
  for (const link of page.links) {
    if (link === SCRAPBOX_COLLECT_PAGE || link === SCRAPBOX_INDEX_PAGE) {
      continue
    }

    links.push(link)
  }

  const relatedPages: RelatedPage[] = []
  for (const link of [
    ...page.relatedPages.links1hop,
    ...page.relatedPages.links2hop,
  ]) {
    if (link.title === title) {
      continue
    }

    const info = infosMap.get(link.title)
    if (
      !info ||
      link.title === SCRAPBOX_COLLECT_PAGE ||
      link.title === SCRAPBOX_INDEX_PAGE
    ) {
      continue
    }

    const related = await getPage(link.title)
    if (!related) {
      throw new Error(`Page not found: ${link.title}`)
    }

    relatedPages.push({
      id: related.id,
      title: related.title,
      image: related.image?.startsWith('https://i.gyazo.com')
        ? related.image.replace(/\/raw$/, '')
        : related.image,
      description: descriptionsToText(related.descriptions),
      created: new Date(related.created * 1000),
      updated: new Date(related.updated * 1000),
      links: related.links.filter(
        (l) => l !== SCRAPBOX_COLLECT_PAGE || l !== SCRAPBOX_INDEX_PAGE,
      ),
    })
  }

  const externalLinks = page.relatedPages.projectLinks1hop.map((l) => ({
    id: l.id,
    title: l.title,
    image: l.image,
    description: descriptionsToText(l.descriptions),
    updated: new Date(l.updated * 1000),
  }))

  return {
    id: page.id,
    title: page.title,
    image: page.image?.startsWith('https://i.gyazo.com')
      ? page.image.replace(/\/raw$/, '')
      : page.image,
    description: descriptionsToText(page.descriptions),
    pin: page.pin === 1,
    created: new Date(page.created * 1000),
    updated: new Date(page.updated * 1000),
    persistent: page.persistent,
    blocks: parse(page.lines.map((l) => l.text).join('\n')),
    links,
    icons: page.icons,
    files: page.files,
    relatedPages,
    externalLinks,
  }
}

export async function fetchPages(): Promise<Page[]> {
  const infos = await fetchPageInfos()
  const pages: Page[] = []
  for (const info of infos) {
    const page = await fetchPage(info.title)
    if (!page) {
      throw new Error(`Page not found: ${info.title}`)
    }

    pages.push(page)
  }

  return pages.sort((a, b) => b.created.getTime() - a.created.getTime())
}

let codeFetching = false
let codeCache: Map<string, string> | null = null

export async function fetchCodes(): Promise<string[]> {
  if (codeFetching) {
    while (codeFetching) {
      await wait(WAIT_CACHE_MS)
    }
  }

  if (codeCache) {
    return [...codeCache.keys()]
  }

  console.log('fetchCodes: try fetching')

  codeFetching = true

  const pages = await fetchPages()

  const codes = Map.groupBy(
    pages.flatMap((p) =>
      p.blocks
        .filter((b): b is CodeBlock => b.type === 'codeBlock')
        .map((b) => ({
          pagetitle: p.title,
          filename: b.fileName,
          code: b.content,
        })),
    ),
    ({ pagetitle, filename }) => [pagetitle, filename].join('/'),
  )

  const codesMap = new Map(
    [...codes.entries()].map(([k, v]) => [k, v.map((c) => c.code).join('\n')]),
  )

  codeCache = codesMap

  codeFetching = false

  return [...codes.keys()]
}

export async function fetchCode(slug: string): Promise<string | null> {
  if (!codeCache) {
    await fetchCodes()
  }

  return codeCache?.get(slug) ?? null
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
