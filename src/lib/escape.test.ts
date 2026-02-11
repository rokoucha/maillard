import { describe, expect, it } from 'vitest'
import { cosensePageTitleEscape } from './escape'

describe('cosensePageTitleEscape', () => {
  it('ページタイトルで使われる特殊文字をエスケープする', () => {
    expect(cosensePageTitleEscape('foo/bar?x#y')).toBe('foo%2Fbar%3Fx%23y')
  })

  it('通常の文字列はそのまま保持する', () => {
    expect(cosensePageTitleEscape('hello world')).toBe('hello world')
  })
})
