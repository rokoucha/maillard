interface Env {
  D1: D1Database
  SCRAPBOX_BASE_URL?: string | undefined
  SCRAPBOX_PROXY_TTL: string
}

const SCRAPBOX_DEFAULT_BASE_URL = 'https://scrapbox.io/'

const ALLOWED_REQUEST_HEADERS = ['accept', 'cookie', 'referer', 'user-agent']
const ALLOWED_RESPONSE_HEADERS = ['content-type', 'content-length']

function sanitzeRequestHeaders(headers: Headers) {
  return new Headers(
    [...headers.entries()].filter(([name]) =>
      ALLOWED_REQUEST_HEADERS.includes(name.toLowerCase()),
    ),
  )
}

function sanitzeResponseHeaders(headers: Headers) {
  return new Headers(
    [...headers.entries()].filter(([name]) =>
      ALLOWED_RESPONSE_HEADERS.includes(name.toLowerCase()),
    ),
  )
}

async function digestRequest(request: Request) {
  const data = new TextEncoder().encode(
    JSON.stringify({
      method: request.method,
      url: request.url,
      headers: Object.entries(sanitzeRequestHeaders(request.headers).entries()),
    }),
  )

  const digest = await crypto.subtle.digest(
    {
      name: 'SHA-256',
    },
    data,
  )

  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const now = Date.now()

  const baseUrl = new URL(
    context.env.SCRAPBOX_BASE_URL ?? SCRAPBOX_DEFAULT_BASE_URL,
  )

  const proxyTtl = Number(context.env.SCRAPBOX_PROXY_TTL) * 1000

  const path = Array.isArray(context.params.path)
    ? context.params.path.join('/')
    : context.params.path

  const currentUrl = new URL(context.request.url)

  const upstreamUrl = new URL(path, baseUrl)
  upstreamUrl.search = currentUrl.search

  const request = new Request(upstreamUrl.toString(), {
    method: context.request.method,
    headers: [...context.request.headers.entries()].filter(([name]) =>
      ALLOWED_REQUEST_HEADERS.includes(name.toLowerCase()),
    ),
  })

  const key = await digestRequest(request)

  const cached = await context.env.D1.prepare(
    'SELECT * FROM cache WHERE key = ?',
  )
    .bind(key)
    .first<{
      body: ArrayBuffer
      created: number
      headers: string
      key: string
      status: number
    }>()
  if (cached && now - cached.created <= proxyTtl) {
    return new Response(new Uint8Array(cached.body), {
      status: cached.status,
      headers: {
        ...JSON.parse(cached.headers),
        'X-Cache': 'HIT',
      },
    })
  }

  await context.env.D1.prepare('DELETE FROM cache WHERE key = ?')
    .bind(key)
    .run()
    .catch(() => {})

  const response = await fetch(request)

  if (!response.ok) {
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(sanitzeResponseHeaders(response.headers)),
        'X-Cache': 'SKIP',
      },
    })
  }

  const result = await context.env.D1.prepare(
    'INSERT INTO cache (key, body, created, headers, status) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(
      key,
      await response.clone().arrayBuffer(),
      now,
      JSON.stringify(
        Object.fromEntries(sanitzeResponseHeaders(response.headers)),
      ),
      response.status,
    )
    .run()
    .catch((err) => {
      console.warn('Failed to cache response', err)
      return null
    })

  return new Response(response.body, {
    status: response.status,
    headers: {
      ...Object.fromEntries(sanitzeResponseHeaders(response.headers)),
      'X-Cache': 'MISS',
      'X-Cache-Result': result ? 'STORED' : 'FAILED',
    },
  })
}
