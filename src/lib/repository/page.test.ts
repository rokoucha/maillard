import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GetPage } from '../../schema/cosense'
import * as cosense from '../cosense'
import { findByTitle, findPageOnly } from './page'

vi.mock('../cosense', () => ({
  page: vi.fn(),
}))

const mockLinksHop = (
  overrides: Partial<GetPage['relatedPages']['links1hop'][number]> = {},
): GetPage['relatedPages']['links1hop'][number] => ({
  id: 'hop-1',
  title: 'Related Page',
  titleLc: 'related page',
  image: null,
  descriptions: ['related desc'],
  linksLc: ['some link'],
  linked: 1,
  pageRank: 0,
  infoboxDisableLinks: [],
  created: 1700000000,
  updated: 1700000001,
  accessed: 1700000002,
  ...overrides,
})

const mockGetPage = (overrides: Partial<GetPage> = {}): GetPage => ({
  id: 'page-1',
  title: 'Test Page',
  image: null,
  descriptions: ['This is a test page'],
  users: [{ id: 'u-1' }],
  lastUpdateUser: { id: 'u-1' },
  pin: 0,
  views: 0,
  linked: 0,
  created: 1700000000,
  updated: 1700000001,
  accessed: 1700000002,
  snapshotCreated: null,
  pageRank: 0,
  lastAccessed: null,
  persistent: true,
  lines: [{ id: 'l-1', text: 'Test Page', userId: 'u-1', created: 1700000000, updated: 1700000001 },
          { id: 'l-2', text: 'body text', userId: 'u-1', created: 1700000000, updated: 1700000001 }],
  links: ['Other Page', 'Another Page'],
  icons: [],
  files: [],
  infoboxDefinition: [],
  infoboxResult: [],
  infoboxDisableLinks: [],
  relatedPages: {
    links1hop: [mockLinksHop({ id: 'hop-1', title: 'Direct Page', titleLc: 'direct page', linksLc: ['test page'] })],
    links2hop: [mockLinksHop({ id: 'hop-2', title: 'Indirect Page', titleLc: 'indirect page', linksLc: ['direct page'] })],
    projectLinks1hop: [],
    hasBackLinksOrIcons: false,
    search: '',
    searchBackend: '',
  },
  ...overrides,
})

describe('findPageOnly', () => {
  beforeEach(() => {
    vi.mocked(cosense.page).mockReset()
  })

  it('ページが存在しない場合はnullを返す', async () => {
    vi.mocked(cosense.page).mockResolvedValue(null)

    const result = await findPageOnly('Test Page')

    expect(result).toBeNull()
    expect(cosense.page).toHaveBeenCalledOnce()
    expect(cosense.page).toHaveBeenCalledWith('Test Page')
  })

  it('cosense.pageを1回だけ呼ぶ', async () => {
    vi.mocked(cosense.page).mockResolvedValue(mockGetPage())

    await findPageOnly('Test Page')

    expect(cosense.page).toHaveBeenCalledOnce()
  })

  it('relatedPagesが空で返る', async () => {
    vi.mocked(cosense.page).mockResolvedValue(mockGetPage())

    const result = await findPageOnly('Test Page')

    expect(result).not.toBeNull()
    expect(result!.relatedPages.direct).toEqual([])
    expect(result!.relatedPages.indirect).toEqual([])
  })

  it('ページのメタデータが正しくマッピングされる', async () => {
    vi.mocked(cosense.page).mockResolvedValue(
      mockGetPage({
        id: 'page-xyz',
        title: 'My Page',
        links: ['Link A', 'Link B'],
        created: 1700000000,
        updated: 1700001000,
        persistent: true,
      }),
    )

    const result = await findPageOnly('My Page')

    expect(result).not.toBeNull()
    expect(result!.id).toBe('page-xyz')
    expect(result!.title).toBe('My Page')
    expect(result!.links).toEqual(['Link A', 'Link B'])
    expect(result!.created).toEqual(new Date(1700000000 * 1000))
    expect(result!.updated).toEqual(new Date(1700001000 * 1000))
    expect(result!.persistent).toBe(true)
  })

  it('Gyazo画像URLの末尾の/rawを除去する', async () => {
    vi.mocked(cosense.page).mockResolvedValue(
      mockGetPage({ image: 'https://i.gyazo.com/abc123/raw' }),
    )

    const result = await findPageOnly('Test Page')

    expect(result!.image).toBe('https://i.gyazo.com/abc123')
  })

  it('Gyazo以外の画像URLはそのまま返す', async () => {
    vi.mocked(cosense.page).mockResolvedValue(
      mockGetPage({ image: 'https://example.com/image.png' }),
    )

    const result = await findPageOnly('Test Page')

    expect(result!.image).toBe('https://example.com/image.png')
  })
})

describe('findByTitle', () => {
  beforeEach(() => {
    vi.mocked(cosense.page).mockReset()
  })

  const titleLcMap = new Map([
    ['direct page', 'Direct Page'],
    ['indirect page', 'Indirect Page'],
    ['test page', 'Test Page'],
  ])

  it('ページが存在しない場合はnullを返す', async () => {
    vi.mocked(cosense.page).mockResolvedValue(null)

    const result = await findByTitle('Test Page', titleLcMap)

    expect(result).toBeNull()
    expect(cosense.page).toHaveBeenCalledOnce()
  })

  it('cosense.pageを1回だけ呼ぶ(関連ページを個別取得しない)', async () => {
    vi.mocked(cosense.page).mockResolvedValue(mockGetPage())

    await findByTitle('Test Page', titleLcMap)

    expect(cosense.page).toHaveBeenCalledOnce()
  })

  it('links1hopからdirect related pagesを構築する', async () => {
    vi.mocked(cosense.page).mockResolvedValue(
      mockGetPage({
        relatedPages: {
          links1hop: [
            mockLinksHop({
              id: 'hop-1',
              title: 'Direct Page',
              titleLc: 'direct page',
              image: null,
              descriptions: ['direct desc'],
              linksLc: ['test page'],
              created: 1700000100,
              updated: 1700000200,
            }),
          ],
          links2hop: [],
          projectLinks1hop: [],
          hasBackLinksOrIcons: false,
          search: '',
          searchBackend: '',
        },
      }),
    )

    const result = await findByTitle('Test Page', titleLcMap)

    expect(result!.relatedPages.direct).toHaveLength(1)
    expect(result!.relatedPages.direct[0].id).toBe('hop-1')
    expect(result!.relatedPages.direct[0].title).toBe('Direct Page')
    expect(result!.relatedPages.direct[0].created).toEqual(new Date(1700000100 * 1000))
    expect(result!.relatedPages.direct[0].updated).toEqual(new Date(1700000200 * 1000))
  })

  it('links2hopからindirect related pagesを構築する', async () => {
    vi.mocked(cosense.page).mockResolvedValue(
      mockGetPage({
        relatedPages: {
          links1hop: [],
          links2hop: [
            mockLinksHop({
              id: 'hop-2',
              title: 'Indirect Page',
              titleLc: 'indirect page',
              linksLc: ['direct page'],
            }),
          ],
          projectLinks1hop: [],
          hasBackLinksOrIcons: false,
          search: '',
          searchBackend: '',
        },
      }),
    )

    const result = await findByTitle('Test Page', titleLcMap)

    expect(result!.relatedPages.indirect).toHaveLength(1)
    expect(result!.relatedPages.indirect[0].id).toBe('hop-2')
    expect(result!.relatedPages.indirect[0].title).toBe('Indirect Page')
  })

  it('linksLcをtitleLcMapでoriginal caseに復元する', async () => {
    vi.mocked(cosense.page).mockResolvedValue(
      mockGetPage({
        relatedPages: {
          links1hop: [
            mockLinksHop({
              linksLc: ['direct page', 'test page', 'unknown page'],
            }),
          ],
          links2hop: [],
          projectLinks1hop: [],
          hasBackLinksOrIcons: false,
          search: '',
          searchBackend: '',
        },
      }),
    )

    const result = await findByTitle('Test Page', titleLcMap)

    expect(result!.relatedPages.direct[0].links).toEqual([
      'Direct Page',
      'Test Page',
      'unknown page', // mapにないものはそのまま
    ])
  })

  it('Gyazo画像URLの/rawを除去する', async () => {
    vi.mocked(cosense.page).mockResolvedValue(
      mockGetPage({
        relatedPages: {
          links1hop: [
            mockLinksHop({ image: 'https://i.gyazo.com/abc/raw' }),
          ],
          links2hop: [],
          projectLinks1hop: [],
          hasBackLinksOrIcons: false,
          search: '',
          searchBackend: '',
        },
      }),
    )

    const result = await findByTitle('Test Page', titleLcMap)

    expect(result!.relatedPages.direct[0].image).toBe('https://i.gyazo.com/abc')
  })
})
