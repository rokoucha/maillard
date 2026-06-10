import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as cosense from '../cosense'
import { findMany } from './pageinfo'

vi.mock('../env', () => ({
  SCRAPBOX_COLLECT_PAGE: 'Collect',
  SCRAPBOX_INDEX_PAGE: 'Index',
}))

vi.mock('../cosense', () => ({
  links1hop: vi.fn(),
  page: vi.fn(),
}))

vi.mock('../domain/page', () => ({
  parseDescription: vi.fn(async (descriptions: string[]) =>
    descriptions.map((text) => ({ type: 'plain', raw: text, text })),
  ),
}))

const makeLinksHop = (
  overrides: Partial<
    Awaited<ReturnType<typeof cosense.links1hop>>[number]
  > = {},
): Awaited<ReturnType<typeof cosense.links1hop>>[number] => ({
  id: 'page-1',
  title: 'Page One',
  titleLc: 'page_one',
  image: null,
  descriptions: ['desc'],
  linksLc: ['collect'],
  linked: 1,
  pageRank: 1,
  infoboxDisableLinks: [],
  created: 1700000000,
  updated: 1700000100,
  accessed: 1700000200,
  ...overrides,
})

const makePage = (
  overrides: Partial<
    NonNullable<Awaited<ReturnType<typeof cosense.page>>>
  > = {},
): NonNullable<Awaited<ReturnType<typeof cosense.page>>> => ({
  id: 'index-1',
  title: 'Index',
  image: null,
  descriptions: ['index desc'],
  users: [{ id: 'u-1' }],
  lastUpdateUser: { id: 'u-1' },
  pin: 0,
  views: 0,
  linked: 0,
  created: 1700000300,
  updated: 1700000400,
  accessed: 1700000500,
  snapshotCreated: null,
  pageRank: 0,
  lastAccessed: null,
  persistent: true,
  lines: [],
  links: ['Page One'],
  icons: [],
  files: [],
  infoboxDefinition: [],
  infoboxResult: [],
  infoboxDisableLinks: [],
  relatedPages: {
    links1hop: [],
    links2hop: [],
    projectLinks1hop: [],
    hasBackLinksOrIcons: false,
    search: '',
    searchBackend: '',
  },
  ...overrides,
})

describe('findMany', () => {
  beforeEach(() => {
    vi.mocked(cosense.links1hop).mockReset()
    vi.mocked(cosense.page).mockReset()
  })

  it('収集ページのlinks1hopを公開対象として返す', async () => {
    vi.mocked(cosense.links1hop).mockResolvedValue([
      makeLinksHop({ title: 'Page One', titleLc: 'page_one' }),
    ])
    vi.mocked(cosense.page).mockResolvedValue(null)

    const result = await findMany()

    expect(cosense.links1hop).toHaveBeenCalledWith('Collect')
    expect(result).toMatchObject([
      {
        title: 'Page One',
        titleLc: 'page_one',
        links: ['collect'],
      },
    ])
  })

  it('index pageがlinks1hopにない場合は追加する', async () => {
    vi.mocked(cosense.links1hop).mockResolvedValue([makeLinksHop()])
    vi.mocked(cosense.page).mockResolvedValue(makePage())

    const result = await findMany()

    expect(cosense.page).toHaveBeenCalledWith('Index')
    expect(result.map((p) => p.title)).toContain('Index')
  })

  it('collect page自身はindex pageと同一でなければ除外する', async () => {
    vi.mocked(cosense.links1hop).mockResolvedValue([
      makeLinksHop({ title: 'Collect', titleLc: 'collect' }),
      makeLinksHop({ title: 'Page One', titleLc: 'page_one' }),
    ])
    vi.mocked(cosense.page).mockResolvedValue(null)

    const result = await findMany()

    expect(result.map((p) => p.title)).toEqual(['Page One'])
  })
})
