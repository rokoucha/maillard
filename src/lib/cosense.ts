import * as v from 'valibot'
import pkg from '../../package.json' assert { type: 'json' }
import {
  GetPage,
  GetPageResponse,
  SearchTitlePage,
  SearchTitleResponse,
} from '../schema/cosense'
import { SCRAPBOX_API_URL, SCRAPBOX_CONNECT_SID, SCRAPBOX_PROJECT } from './env'

const headers = {
  ...(SCRAPBOX_CONNECT_SID && {
    Cookie: `connect.sid=${SCRAPBOX_CONNECT_SID}`,
  }),
  'User-Agent': `${pkg.name}/${pkg.version}`,
} satisfies HeadersInit

export function resolveIconUrl(node: {
  pathType: 'root' | 'relative'
  path: string
}): string {
  return node.pathType === 'relative'
    ? `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${node.path}/icon`
    : `https://scrapbox.io/api/pages${node.path}/icon`
}

export function isInternalUrl(url: string): boolean {
  return (
    url.startsWith('https://scrapbox.io') ||
    url.startsWith('https://i.gyazo.com')
  )
}

export async function searchTitles(): Promise<SearchTitlePage[]> {
  const pages: SearchTitlePage[] = []
  let followingId = ''
  do {
    const url = new URL(
      `${SCRAPBOX_API_URL}/pages/${SCRAPBOX_PROJECT}/search/titles`,
    )
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
    `${SCRAPBOX_API_URL}/pages/${SCRAPBOX_PROJECT}/${title.replaceAll('/', '%2F')}`,
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

export async function fetchInternalImage(
  url: string,
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  if (!isInternalUrl(url)) {
    return null
  }

  const res = await fetch(url, { cache: 'force-cache', headers })
  if (!res.ok) {
    return null
  }

  return {
    body: await res.arrayBuffer(),
    contentType: res.headers.get('Content-Type') ?? '',
  }
}
