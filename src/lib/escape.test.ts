import { describe, expect, it } from 'vitest'
import { cosensePageTitleEscape, escapePageTitleForPath } from './escape'

describe('cosensePageTitleEscape', () => {
  it('ページタイトルで使われる特殊文字をエスケープする', () => {
    expect(cosensePageTitleEscape('foo/bar?x#y')).toBe('foo%2Fbar%3Fx%23y')
  })

  it('通常の文字列はそのまま保持する', () => {
    expect(cosensePageTitleEscape('hello world')).toBe('hello world')
  })
})

describe('escapePageTitleForPath', () => {
  it('公開URL向けに / と非ASCII文字を含むタイトルをエンコードする', () => {
    expect(escapePageTitleForPath('日本語/テスト')).toBe(
      '%E6%97%A5%E6%9C%AC%E8%AA%9E%2F%E3%83%86%E3%82%B9%E3%83%88',
    )
  })

  it('reserved文字と空白も含めて安定した表現にする', () => {
    expect(escapePageTitleForPath('100% ready? #go now')).toBe(
      '100%25%20ready%3F%20%23go%20now',
    )
  })
})
