import * as v from 'valibot'
import pkg from '../../package.json' assert { type: 'json' }
import {
  GetPage,
  GetPageResponse,
  SearchTitlePage,
  SearchTitleResponse,
} from '../schema/cosense'
import {
  SCRAPBOX_BASE_URL,
  SCRAPBOX_CONNECT_SID,
  SCRAPBOX_PROJECT,
  SCRAPBOX_PROXY_URL,
} from './env'

const BASE_URL = SCRAPBOX_PROXY_URL ?? SCRAPBOX_BASE_URL

const headers = {
  ...(SCRAPBOX_CONNECT_SID && {
    Cookie: `connect.sid=${SCRAPBOX_CONNECT_SID}`,
  }),
  'User-Agent': `${pkg.name}/${pkg.version}`,
} satisfies HeadersInit

export async function searchTitles(): Promise<SearchTitlePage[]> {
  const pages: SearchTitlePage[] = []
  let followingId = ''
  do {
    const url = new URL(`api/pages/${SCRAPBOX_PROJECT}/search/titles`, BASE_URL)
    if (followingId) {
      url.searchParams.append('followingId', followingId)
    }

    const res = await fetch(url, { cache: 'force-cache', headers })

    const data = await v.parseAsync(SearchTitleResponse, await res.json())
    if ('message' in data) {
      throw new Error(data.message)
    }
    pages.push(...data.slice(followingId ? 1 : 0))

    followingId = res.headers.get('X-Following-Id') ?? ''
  } while (followingId)

  return pages
}

export async function page(title: string): Promise<GetPage | null> {
  const url = new URL(
    `api/pages/${SCRAPBOX_PROJECT}/${title.replaceAll('/', '%2F')}`,
    BASE_URL,
  )
  const res = await fetch(url, { cache: 'force-cache', headers })

  if (res.status === 404) {
    return null
  }

  const data = await v.parseAsync(GetPageResponse, await res.json())
  if ('message' in data) {
    throw new Error(data.message)
  }

  return data
}

export async function headInternalImage(url: string): Promise<Response> {
  if (!url.startsWith(SCRAPBOX_BASE_URL)) {
    throw new Error(`Invalid internal image URL: ${url}`)
  }

  const u = new URL(url.replace(SCRAPBOX_BASE_URL, ''), BASE_URL)

  const res = await fetch(u, { cache: 'force-cache', headers, method: 'HEAD' })
  return res
}

export async function getInternalImage(url: string): Promise<Response> {
  if (!url.startsWith(SCRAPBOX_BASE_URL)) {
    throw new Error(`Invalid internal image URL: ${url}`)
  }

  const u = new URL(url.replace(SCRAPBOX_BASE_URL, ''), BASE_URL)

  const res = await fetch(u, { cache: 'force-cache', headers })
  return res
}
