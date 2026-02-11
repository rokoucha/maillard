import { describe, expect, it, vi } from 'vitest'
import { digestSHA1 } from '../digest'
import type { PageInfo } from '../domain/pageinfo'
import { present, presentRelatedPage } from './page'

vi.mock('../digest', () => ({
  digestSHA1: vi.fn(async (raw: string) => `hashed:${raw}`),
}))

describe('present', () => {
  it('ページ情報を表示用データへ変換する', async () => {
    const pageInfos = new Map<string, PageInfo>([
      [
        'Internal Page',
        {
          id: 'pi-1',
          title: 'Internal Page',
          links: [],
          updated: new Date('2024-01-01T00:00:00Z'),
          image: null,
        },
      ],
    ])

    const response = await present({
      id: 'page-1',
      title: 'Top/Title',
      image: 'https://example.com/thumbnail.png',
      description: [
        { type: 'plain', raw: 'desc', text: 'Hello ' },
        {
          type: 'link',
          raw: '[Internal Page]',
          pathType: 'relative',
          href: 'Internal Page',
          content: '',
        },
      ],
      created: new Date('2024-01-01T00:00:00Z'),
      updated: new Date('2024-01-02T00:00:00Z'),
      persistent: true,
      blocks: [
        {
          type: 'line',
          indent: 0,
          nodes: [
            {
              type: 'icon',
              raw: '[* Internal Page.icon]',
              pathType: 'relative',
              path: 'Internal Page',
              src: 'https://scrapbox.io/api/pages/project/Internal Page/icon',
            },
            {
              type: 'link',
              raw: '[Another Page]',
              pathType: 'relative',
              href: 'Another Page',
              content: '',
            },
            {
              type: 'hashTag',
              raw: '#Internal Page',
              href: 'Internal Page',
            },
            {
              type: 'decoration',
              raw: '/Internal Page/',
              rawDecos: '/',
              decos: [],
              nodes: [
                {
                  type: 'link',
                  raw: '[Internal Page]',
                  pathType: 'relative',
                  href: 'Internal Page',
                  content: '',
                },
              ],
            },
          ],
        },
        {
          type: 'table',
          indent: 0,
          fileName: 't.table',
          cells: [
            [
              [
                {
                  type: 'strong',
                  raw: '**x**',
                  nodes: [
                    {
                      type: 'link',
                      raw: '[https://example.com]',
                      pathType: 'absolute',
                      href: 'https://example.com',
                      content: '',
                    },
                  ],
                },
              ],
            ],
          ],
        },
        {
          type: 'codeBlock',
          indent: 0,
          fileName: 'example.ts',
          content: 'const n = 1',
        },
        { type: 'title', text: 'drop me' },
      ],
      links: ['Internal Page', 'Another Page'],
      relatedPages: {
        direct: [
          {
            id: 'rp-1',
            title: 'Direct/Page',
            image: null,
            description: [{ type: 'plain', raw: 'd', text: 'direct' }],
            created: new Date('2024-01-03T00:00:00Z'),
            updated: new Date('2024-01-04T00:00:00Z'),
            links: ['Internal Page'],
          },
        ],
        indirect: [
          {
            id: 'rp-2',
            title: 'Indirect Page',
            image: null,
            description: [{ type: 'plain', raw: 'i', text: 'indirect' }],
            created: new Date('2024-01-05T00:00:00Z'),
            updated: new Date('2024-01-06T00:00:00Z'),
            links: ['Another Page'],
          },
        ],
      },
    }, pageInfos)

    expect(response.id).toBe('page-1')
    expect(response.title).toBe('Top/Title')
    expect(response.escapedTitle).toBe('Top%2FTitle')
    expect(response.description).toBe('Hello Internal Page')
    expect(response.blocks).toHaveLength(3)

    const line = response.blocks[0]
    expect(line.type).toBe('line')
    if (line.type === 'line') {
      const [icon, link, hashTag, decoration] = line.nodes

      expect(icon).toMatchObject({
        type: 'icon',
        pathType: 'internal',
        href: '/Internal Page',
      })
      expect(link).toMatchObject({
        type: 'link',
        pathType: 'external',
        href: 'https://scrapbox.io/project/Another Page',
        content: 'Another Page',
      })
      expect(hashTag).toMatchObject({
        type: 'hashTag',
        pathType: 'internal',
        href: '/Internal Page',
        content: 'Internal Page',
      })
      expect(decoration).toMatchObject({
        type: 'decoration',
        hash: 'hashed:/Internal Page/',
      })

      if (decoration.type === 'decoration') {
        expect(decoration.nodes[0]).toMatchObject({
          type: 'link',
          pathType: 'internal',
          href: '/Internal Page',
          content: 'Internal Page',
        })
      }
    }

    const table = response.blocks[1]
    expect(table.type).toBe('table')
    if (table.type === 'table') {
      expect(table.cells[0][0][0]).toMatchObject({
        type: 'strong',
      })
    }

    expect(response.relatedPages.map((p) => p.id)).toEqual(['rp-1', 'rp-2'])
    expect(response.relatedPages[0].escapedTitle).toBe('Direct%2FPage')
    expect(digestSHA1).toHaveBeenCalledWith('/Internal Page/')
  })
})

describe('presentRelatedPage', () => {
  it('related pageを表示用に変換する', async () => {
    const response = await presentRelatedPage({
      id: 'r-1',
      title: 'tag/page',
      image: 'https://example.com/image.png',
      description: [
        { type: 'plain', raw: 'p', text: 'A ' },
        { type: 'hashTag', raw: '#topic', href: 'topic' },
        { type: 'commandLine', raw: '$ echo ok', symbol: '$', text: 'echo ok' },
      ],
      created: new Date('2024-02-01T00:00:00Z'),
      updated: new Date('2024-02-02T00:00:00Z'),
      links: ['topic'],
    })

    expect(response).toMatchObject({
      id: 'r-1',
      title: 'tag/page',
      escapedTitle: 'tag%2Fpage',
      image: 'https://example.com/image.png',
      description: 'A #topic$ echo ok',
      links: ['topic'],
    })
  })
})
