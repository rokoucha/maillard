import { describe, expect, it } from 'vitest'
import { buildUrl, rebaseUrl } from './url'

describe('buildUrl', () => {
  it('ベースURLにトレイリングスラッシュがある場合に正しく結合する', () => {
    expect(
      buildUrl('https://scrapbox.io/', 'api/pages/proj/foo').toString(),
    ).toBe('https://scrapbox.io/api/pages/proj/foo')
  })

  it('ベースURLにトレイリングスラッシュがない場合も正しく結合する', () => {
    expect(
      buildUrl('https://scrapbox.io', 'api/pages/proj/foo').toString(),
    ).toBe('https://scrapbox.io/api/pages/proj/foo')
  })

  it('パスを持つベースURLにトレイリングスラッシュがない場合も最終セグメントを保持する', () => {
    // This is the proxy bug case
    expect(
      buildUrl('https://proxy.example.com/v1', 'api/pages/proj/foo').toString(),
    ).toBe('https://proxy.example.com/v1/api/pages/proj/foo')
  })

  it('パスを持つベースURLにトレイリングスラッシュがある場合に正しく結合する', () => {
    expect(
      buildUrl(
        'https://proxy.example.com/v1/',
        'api/pages/proj/foo',
      ).toString(),
    ).toBe('https://proxy.example.com/v1/api/pages/proj/foo')
  })

  it('relativePathが先頭スラッシュを持つ場合も正しく結合する', () => {
    expect(
      buildUrl('https://scrapbox.io/', '/api/pages/proj/foo').toString(),
    ).toBe('https://scrapbox.io/api/pages/proj/foo')
  })

  it('空のrelativePathの場合はベースURLをそのまま返す', () => {
    expect(buildUrl('https://scrapbox.io/', '').toString()).toBe(
      'https://scrapbox.io/',
    )
  })
})

describe('rebaseUrl', () => {
  it('fromBaseからtoBaseへURLを書き換える', () => {
    expect(
      rebaseUrl(
        'https://scrapbox.io/files/proj/img.png',
        'https://scrapbox.io/',
        'https://proxy.example.com/',
      ).toString(),
    ).toBe('https://proxy.example.com/files/proj/img.png')
  })

  it('fromBaseにトレイリングスラッシュがない場合も正しく動作する', () => {
    expect(
      rebaseUrl(
        'https://scrapbox.io/files/proj/img.png',
        'https://scrapbox.io',
        'https://proxy.example.com/',
      ).toString(),
    ).toBe('https://proxy.example.com/files/proj/img.png')
  })

  it('toBaseにサブパスがある場合も正しく書き換える', () => {
    expect(
      rebaseUrl(
        'https://scrapbox.io/files/proj/img.png',
        'https://scrapbox.io/',
        'https://proxy.example.com/sub/',
      ).toString(),
    ).toBe('https://proxy.example.com/sub/files/proj/img.png')
  })

  it('fromBaseにサブパスがある場合はそのパスを除去する', () => {
    expect(
      rebaseUrl(
        'https://origin.example.com/api/files/img.png',
        'https://origin.example.com/api/',
        'https://proxy.example.com/',
      ).toString(),
    ).toBe('https://proxy.example.com/files/img.png')
  })

  it('absoluteUrlがfromBaseで始まらない場合は例外を投げる', () => {
    expect(() =>
      rebaseUrl(
        'https://example.com/files/img.png',
        'https://scrapbox.io/',
        'https://proxy.example.com/',
      ),
    ).toThrow('URL does not start with fromBase')
  })
})
