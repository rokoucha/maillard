import { describe, expect, it } from 'vitest'
import type { PageResponse, RelatedPageResponse } from './presentation/page'
import { buildAtomFeed, buildJsonFeed } from './feed'

const indexPage: PageResponse = {
  id: 'index',
  title: 'Index',
  escapedTitle: 'Index',
  image: 'https://example.com/icon.png',
  description: 'Index page',
  created: new Date('2024-01-01T00:00:00Z'),
  updated: new Date('2024-01-02T00:00:00Z'),
  persistent: true,
  blocks: [],
  links: [],
  relatedPages: [],
}

const pages: RelatedPageResponse[] = [
  {
    id: 'old',
    title: 'Old Page',
    escapedTitle: 'Old%20Page',
    image: null,
    description: 'Older description',
    created: new Date('2024-02-01T00:00:00Z'),
    updated: new Date('2024-02-02T00:00:00Z'),
    links: ['topic'],
  },
  {
    id: 'new',
    title: 'A & B <Latest> "Page"',
    escapedTitle: 'A%20%26%20B',
    image: 'https://example.com/latest.png',
    description: `5 > 3 & 2 < 4 "quoted" 'single'`,
    created: new Date('2024-03-01T00:00:00Z'),
    updated: new Date('2024-03-03T00:00:00Z'),
    links: ['topic', 'latest'],
  },
]

describe('buildJsonFeed', () => {
  it('builds the migration JSON Feed URL and sorts entries by updated date', () => {
    const feed = buildJsonFeed({
      baseUrl: new URL('https://example.com/'),
      indexPage,
      pages,
      siteLang: 'ja',
      siteName: 'Test Site',
    })

    expect(feed.feed_url).toBe('https://example.com/feed.json')
    expect(feed.items.map((item) => item.id)).toEqual([
      'tag:example.com,2024-11-09:new',
      'tag:example.com,2024-11-09:old',
    ])
    expect(feed.items[0]).toMatchObject({
      url: 'https://example.com/A%20%26%20B',
      content_text: `5 > 3 & 2 < 4 "quoted" 'single'`,
      tags: ['topic', 'latest'],
    })
  })
})

describe('buildAtomFeed', () => {
  it('builds an Atom feed with self URL, sorted entries, and escaped text', () => {
    const feed = buildAtomFeed({
      baseUrl: new URL('https://example.com/'),
      indexPage,
      pages,
      siteLang: 'ja',
      siteName: 'Test & Site',
    })

    expect(feed).toContain('<?xml version="1.0" encoding="utf-8"?>')
    expect(feed).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
    expect(feed).toContain(
      '<link rel="self" href="https://example.com/feed.atom" />',
    )
    expect(
      feed.indexOf('<id>tag:example.com,2024-11-09:new</id>'),
    ).toBeLessThan(feed.indexOf('<id>tag:example.com,2024-11-09:old</id>'))
    expect(feed).toContain('<title>Test &amp; Site</title>')
    expect(feed).toContain(
      '<title>A &amp; B &lt;Latest&gt; &quot;Page&quot;</title>',
    )
    expect(feed).toContain(
      '<summary type="text">5 &gt; 3 &amp; 2 &lt; 4 &quot;quoted&quot; &apos;single&apos;</summary>',
    )
  })
})
