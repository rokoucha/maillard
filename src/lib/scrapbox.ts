import * as v from 'valibot'
import {
  GetPageResponse,
  Page,
  PageDetail,
  PageMinimum,
  Pages,
  SearchTitle,
} from '../schema/scrapbox'

const SCRAPBOX_CONNECT_SID = process.env.SCRAPBOX_CONNECT_SID
const SCRAPBOX_INDEX_PAGE = process.env.SCRAPBOX_INDEX_PAGE ?? ''
const SCRAPBOX_PROJECT = process.env.SCRAPBOX_PROJECT ?? ''

const headers = {
  ...(SCRAPBOX_CONNECT_SID && {
    Cookie: `connect.sid=${SCRAPBOX_CONNECT_SID}`,
  }),
  'User-Agent': 'Maillard/0.0',
} satisfies HeadersInit

if (!SCRAPBOX_PROJECT) {
  throw new Error('SCRAPBOX_PROJECT is not set')
}

if (!SCRAPBOX_INDEX_PAGE) {
  throw new Error('SCRAPBOX_INDEX_PAGE is not set')
}

const PAGES_LIMIT_MAX = 1000

type Sort =
  | 'updated'
  | 'created'
  | 'accessed'
  | 'linked'
  | 'views'
  | 'title'
  | 'updatedByMe'

export async function getPages(sort: Sort = 'updated'): Promise<PageDetail[]> {
  const pages: PageDetail[] = []
  let skip = 0
  while (true) {
    const url = new URL(`https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}`)
    url.searchParams.append('limit', String(PAGES_LIMIT_MAX))
    url.searchParams.append('skip', String(skip))
    url.searchParams.append('sort', sort)

    const res = await fetch(url, { headers })
    const data = await v.parseAsync(Pages, await res.json())
    pages.push(...data.pages)

    skip = data.skip + data.limit
    if (skip >= data.count) {
      break
    }
  }

  return pages
}

export async function searchTitle(): Promise<PageMinimum[]> {
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
    const data = await v.parseAsync(SearchTitle, await res.json())
    pages.push(...data)

    followingId = res.headers.get('X-Following-Id') ?? ''
  } while (followingId)

  return pages
}

export async function getPage(title: string): Promise<Page> {
  title = title || SCRAPBOX_INDEX_PAGE

  const url = new URL(
    `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${title}`,
  )
  const res = await fetch(url, { headers })
  const data = await v.parseAsync(GetPageResponse, await res.json())
  if ('message' in data) {
    throw new Error(data.message)
  }

  return data
}
