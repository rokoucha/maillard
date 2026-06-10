import { beforeEach, describe, expect, it, vi } from 'vitest'
import { links1hop } from './cosense'

vi.mock('./env', () => ({
  SCRAPBOX_BASE_URL: 'https://scrapbox.io/',
  SCRAPBOX_CONNECT_SID: undefined,
  SCRAPBOX_PROJECT: 'project',
  SCRAPBOX_PROXY_URL: undefined,
}))

const makeResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
  })

describe('links1hop', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('pagination.nextIdがある間links1hopを取得する', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        makeResponse({
          links1hop: [
            {
              id: 'page-1',
              title: 'Page One',
              titleLc: 'page_one',
              image: null,
              descriptions: [],
              linksLc: ['collect'],
              linked: 1,
              pageRank: 1,
              infoboxDisableLinks: [],
              created: 1700000000,
              updated: 1700000001,
              accessed: 1700000002,
            },
          ],
          pagination: {
            perPage: 1000,
            total: 2,
            hasNext: true,
            nextId: 'page-2',
          },
        }),
      )
      .mockResolvedValueOnce(
        makeResponse({
          links1hop: [
            {
              id: 'page-2',
              title: 'Page Two',
              titleLc: 'page_two',
              image: null,
              descriptions: [],
              linksLc: ['collect'],
              linked: 1,
              pageRank: 1,
              infoboxDisableLinks: [],
              created: 1700000000,
              updated: 1700000001,
              accessed: 1700000002,
            },
          ],
          pagination: {
            perPage: 1000,
            total: 2,
            hasNext: false,
            nextId: null,
          },
        }),
      )

    const result = await links1hop('Collect Page')

    expect(result.map((p) => p.title)).toEqual(['Page One', 'Page Two'])
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      new URL(
        'https://scrapbox.io/api/pages/v2/project/Collect Page/links1hop?perPage=1000',
      ),
      expect.anything(),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      new URL(
        'https://scrapbox.io/api/pages/v2/project/Collect Page/links1hop?perPage=1000&followingId=page-2',
      ),
      expect.anything(),
    )
  })
})
