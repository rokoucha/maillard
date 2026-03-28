import { describe, expect, it } from 'vitest'
import {
  pagePathFromTitle,
  pageUrlFromPath,
  resolvePageTitleCandidatesFromPathname,
  resolvePageTitleFromSlugParts,
} from './page-path'

describe('pagePathFromTitle', () => {
  it('公開URLとして1つのcanonical pathに変換する', () => {
    expect(pagePathFromTitle('日本語/テスト')).toBe(
      '/%E6%97%A5%E6%9C%AC%E8%AA%9E%2F%E3%83%86%E3%82%B9%E3%83%88',
    )
  })
})

describe('pageUrlFromPath', () => {
  it('BASE_URLにパスprefixがあっても保持したまま結合する', () => {
    expect(pageUrlFromPath('https://example.com/base/', '/foo%2Fbar')).toBe(
      'https://example.com/base/foo%2Fbar',
    )
  })
})

describe('resolvePageTitleCandidatesFromPathname', () => {
  it('slashを含むタイトルの表記ゆれを候補として復元する', () => {
    expect(resolvePageTitleCandidatesFromPathname('/foo%252Fbar')).toEqual([
      'foo%252Fbar',
      'foo%2Fbar',
      'foo/bar',
    ])
  })

  it('非ASCIIの表記ゆれを候補として復元する', () => {
    expect(
      resolvePageTitleCandidatesFromPathname(
        '/%E6%97%A5%E6%9C%AC%E8%AA%9E%2F%E3%83%86%E3%82%B9%E3%83%88',
      ),
    ).toEqual([
      '%E6%97%A5%E6%9C%AC%E8%AA%9E%2F%E3%83%86%E3%82%B9%E3%83%88',
      '日本語/テスト',
    ])
  })

  it('不正なエンコードでも例外を投げない', () => {
    expect(() =>
      resolvePageTitleCandidatesFromPathname('/broken%2'),
    ).not.toThrow()
    expect(resolvePageTitleCandidatesFromPathname('/broken%2')).toEqual([
      'broken%2',
    ])
  })

  it('危険なdot segmentは候補から除外する', () => {
    expect(resolvePageTitleCandidatesFromPathname('/foo/%2E%2E/bar')).toEqual([
      'foo/%2E%2E/bar',
    ])
    expect(resolvePageTitleCandidatesFromPathname('/foo/../bar')).toEqual([])
  })
})

describe('resolvePageTitleFromSlugParts', () => {
  it('Next.jsのcatch-all slugから最も解決済みのタイトルを返す', () => {
    expect(resolvePageTitleFromSlugParts(['foo%2Fbar'])).toBe('foo/bar')
    expect(resolvePageTitleFromSlugParts(['foo', 'bar'])).toBe('foo/bar')
  })
})
