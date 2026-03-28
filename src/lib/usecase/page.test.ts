import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PageInfo } from '../domain/pageinfo'
import * as ImageRepository from '../repository/image'
import * as PageRepository from '../repository/page'
import * as PageInfoRepository from '../repository/pageinfo'
import { findAllTitles, findByTitle } from './page'

vi.mock('../env', () => ({
  SCRAPBOX_BASE_URL: 'https://scrapbox.io/',
  SCRAPBOX_COLLECT_PAGE: undefined,
  SCRAPBOX_INDEX_PAGE: 'Index',
  SCRAPBOX_PROJECT: 'project',
  SCRAPBOX_PROXY_URL: undefined,
  SCRAPBOX_CONNECT_SID: undefined,
  BASE_URL: 'https://example.com/',
  SITE_NAME: 'Test',
  SITE_LANG: undefined,
  NEXT_PHASE: undefined,
}))

vi.mock('../repository/page', () => ({
  findSummaryByTitle: vi.fn(),
  findByTitle: vi.fn(),
}))

vi.mock('../repository/pageinfo', () => ({
  findMany: vi.fn(),
}))

vi.mock('../repository/image', () => ({
  resolveInternalImageByUrl: vi.fn(),
}))

const makePageInfo = (overrides: Partial<PageInfo> = {}): PageInfo => ({
  id: 'pi-1',
  title: 'Page One',
  links: [],
  updated: new Date('2024-01-01T00:00:00Z'),
  image: null,
  ...overrides,
})

const makePage = (
  overrides: Partial<
    Awaited<ReturnType<typeof PageRepository.findSummaryByTitle>>
  > = {},
) => ({
  id: 'page-1',
  title: 'Page One',
  image: null,
  description: [{ type: 'plain' as const, raw: 'desc', text: 'description' }],
  created: new Date('2024-01-01T00:00:00Z'),
  updated: new Date('2024-01-02T00:00:00Z'),
  persistent: true,
  blocks: [],
  links: [],
  relatedPages: { direct: [], indirect: [] },
  ...overrides,
})

describe('findAllTitles', () => {
  beforeEach(() => {
    vi.mocked(PageRepository.findSummaryByTitle).mockReset()
    vi.mocked(PageInfoRepository.findMany).mockReset()
    vi.mocked(ImageRepository.resolveInternalImageByUrl).mockReset()
    vi.mocked(ImageRepository.resolveInternalImageByUrl).mockResolvedValue(null)
  })

  it('findSummaryByTitleを使う(findByTitleは使わない)', async () => {
    vi.mocked(PageInfoRepository.findMany).mockResolvedValue([
      makePageInfo({ title: 'Page One' }),
    ])
    vi.mocked(PageRepository.findSummaryByTitle).mockResolvedValue(makePage())

    await findAllTitles()

    expect(PageRepository.findSummaryByTitle).toHaveBeenCalledOnce()
    expect(PageRepository.findByTitle).not.toHaveBeenCalled()
  })

  it('createdの降順でソートされる', async () => {
    vi.mocked(PageInfoRepository.findMany).mockResolvedValue([
      makePageInfo({ title: 'Old Page' }),
      makePageInfo({ title: 'New Page' }),
    ])
    vi.mocked(PageRepository.findSummaryByTitle).mockImplementation(
      async (title) =>
        makePage({
          title,
          created:
            title === 'New Page'
              ? new Date('2024-02-01T00:00:00Z')
              : new Date('2024-01-01T00:00:00Z'),
        }),
    )

    const result = await findAllTitles()

    expect(result[0].title).toBe('New Page')
    expect(result[1].title).toBe('Old Page')
  })

  it('SCRAPBOX_COLLECT_PAGEが未設定のとき全ページを返す', async () => {
    vi.mocked(PageInfoRepository.findMany).mockResolvedValue([
      makePageInfo({ title: 'Page A' }),
      makePageInfo({ title: 'Page B' }),
    ])
    vi.mocked(PageRepository.findSummaryByTitle).mockImplementation(
      async (title) => makePage({ title }),
    )

    const result = await findAllTitles()

    expect(result).toHaveLength(2)
  })
})

describe('findByTitle', () => {
  beforeEach(() => {
    vi.mocked(PageRepository.findByTitle).mockReset()
    vi.mocked(PageInfoRepository.findMany).mockReset()
    vi.mocked(ImageRepository.resolveInternalImageByUrl).mockReset()
    vi.mocked(ImageRepository.resolveInternalImageByUrl).mockResolvedValue(null)
  })

  it('ページが存在しない場合はnullを返す', async () => {
    vi.mocked(PageInfoRepository.findMany).mockResolvedValue([])
    vi.mocked(PageRepository.findByTitle).mockResolvedValue(null)

    const result = await findByTitle('Nonexistent')

    expect(result).toBeNull()
  })

  it('titleLcMapをPageRepository.findByTitleに渡す', async () => {
    vi.mocked(PageInfoRepository.findMany).mockResolvedValue([
      makePageInfo({ title: 'Page One' }),
      makePageInfo({ title: 'Page Two' }),
    ])
    // 1回目(存在確認)はページを返し、2回目(map付き)はnullを返す
    vi.mocked(PageRepository.findByTitle)
      .mockResolvedValueOnce(makePage())
      .mockResolvedValueOnce(null)

    await findByTitle('Page One')

    expect(PageRepository.findByTitle).toHaveBeenCalledTimes(2)
    expect(PageRepository.findByTitle).toHaveBeenNthCalledWith(
      2,
      'Page One',
      expect.any(Map),
    )

    const passedMap = vi.mocked(PageRepository.findByTitle).mock.calls[1][1]
    expect(passedMap.get('page one')).toBe('Page One')
    expect(passedMap.get('page two')).toBe('Page Two')
  })
})
