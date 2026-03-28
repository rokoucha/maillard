import { describe, expect, it, vi } from 'vitest'
import {
  handlePageRequest,
  shouldBypassPageRoute,
  type PageRouteContext,
} from './[[path]]'

function createContext(url: string): PageRouteContext {
  return {
    request: new Request(url),
    env: {
      ASSETS: {
        fetch: vi.fn(async (request: Request) => {
          if (new URL(request.url).pathname === '/foo/bar') {
            return new Response('ok', { status: 200 })
          }

          return new Response('missing', { status: 404 })
        }),
      },
    },
    next: vi.fn(async () => new Response('next', { status: 404 })),
  }
}

describe('shouldBypassPageRoute', () => {
  it('apiとnext assetは除外する', () => {
    expect(shouldBypassPageRoute('/api/feed')).toBe(true)
    expect(shouldBypassPageRoute('/_next/static/chunk.js')).toBe(true)
    expect(shouldBypassPageRoute('/favicon.ico')).toBe(true)
    expect(shouldBypassPageRoute('/foo%2Fbar')).toBe(false)
  })
})

describe('handlePageRequest', () => {
  it('解決できるURLは静的ページへrewriteする', async () => {
    const context = createContext('https://example.com/foo%252Fbar?x=1')

    const response = await handlePageRequest(context)

    expect(await response.text()).toBe('ok')
    expect(context.next).not.toHaveBeenCalled()
    expect(context.env.ASSETS.fetch).toHaveBeenCalledTimes(3)
    expect(context.env.ASSETS.fetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: 'https://example.com/foo/bar?x=1',
      }),
    )
  })

  it('対象外のパスはそのままfallbackする', async () => {
    const context = createContext('https://example.com/_next/static/chunk.js')

    const response = await handlePageRequest(context)

    expect(await response.text()).toBe('next')
    expect(context.env.ASSETS.fetch).not.toHaveBeenCalled()
    expect(context.next).toHaveBeenCalledOnce()
  })

  it('解決できないURLはfallbackする', async () => {
    const context = createContext('https://example.com/not-found')

    const response = await handlePageRequest(context)

    expect(await response.text()).toBe('next')
    expect(context.next).toHaveBeenCalledOnce()
  })
})
