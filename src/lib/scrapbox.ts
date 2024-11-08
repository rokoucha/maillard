import * as v from 'valibot'
import {
  GetPageResponse,
  Page,
  PageMinimum,
  SearchTitleResponse,
} from '../schema/scrapbox'
import {
  SCRAPBOX_COLLECT_PAGE,
  SCRAPBOX_CONNECT_SID,
  SCRAPBOX_INDEX_PAGE,
  SCRAPBOX_PROJECT,
} from './env'

const headers = {
  ...(SCRAPBOX_CONNECT_SID && {
    Cookie: `connect.sid=${SCRAPBOX_CONNECT_SID}`,
  }),
  'User-Agent': 'Maillard/0.0',
} satisfies HeadersInit

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
    const data = await v.parseAsync(SearchTitleResponse, await res.json())
    pages.push(...data)

    followingId = res.headers.get('X-Following-Id') ?? ''
  } while (followingId)

  return pages.filter(
    (page) =>
      !SCRAPBOX_COLLECT_PAGE ||
      page.title === SCRAPBOX_COLLECT_PAGE ||
      page.links.includes(SCRAPBOX_COLLECT_PAGE),
  )
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
