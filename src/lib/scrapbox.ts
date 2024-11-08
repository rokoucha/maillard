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
      !SCRAPBOX_COLLECT_PAGE || page.links.includes(SCRAPBOX_COLLECT_PAGE),
  )
}

export async function getPage(title: string): Promise<Page> {
  const url = new URL(
    `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${title}`,
  )
  const res = await fetch(url, { headers })
  const data = await v.parseAsync(GetPageResponse, await res.json())
  if ('message' in data) {
    throw new Error(data.message)
  }

  data.relatedPages.links1hop = data.relatedPages.links1hop
    .filter(
      (link) =>
        !SCRAPBOX_COLLECT_PAGE || link.linksLc.includes(SCRAPBOX_COLLECT_PAGE),
    )
    .map((link) => ({
      ...link,
      descriptions: link.descriptions.map((description) =>
        description
          .replaceAll(`#${SCRAPBOX_COLLECT_PAGE}`, '')
          .replaceAll(`[${SCRAPBOX_COLLECT_PAGE}]`, ''),
      ),
      linksLc: link.linksLc.filter(
        (linkLc) => linkLc !== SCRAPBOX_COLLECT_PAGE,
      ),
    }))
  data.lines = data.lines.map((line) => ({
    ...line,
    text: line.text
      .replaceAll(`#${SCRAPBOX_COLLECT_PAGE}`, '')
      .replaceAll(`[${SCRAPBOX_COLLECT_PAGE}]`, ''),
  }))
  data.links = data.links.filter((link) => link !== SCRAPBOX_COLLECT_PAGE)

  return data
}
