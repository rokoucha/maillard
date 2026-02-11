import { describe, expect, it } from 'vitest'
import { digestSHA1 } from './digest'

describe('digestSHA1', () => {
  it('空文字列の SHA-1 を返す', async () => {
    await expect(digestSHA1('')).resolves.toBe(
      'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    )
  })

  it('ASCII 文字列の SHA-1 を返す', async () => {
    await expect(digestSHA1('hello world')).resolves.toBe(
      '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed',
    )
  })

  it('マルチバイト文字列の SHA-1 を返す', async () => {
    await expect(digestSHA1('こんにちは')).resolves.toBe(
      '20427a708c3f6f07cf12ab23557982d9e6d23b61',
    )
  })
})
