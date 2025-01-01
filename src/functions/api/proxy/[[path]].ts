interface Env {
  SCRAPBOX_PROXY_TTL: string
}

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

type CacheEntry = {
  body: ArrayBuffer
  created: number
  headers: Headers
  status: number
}

const cache = new Map<string, CacheEntry>()

export const onRequest: PagesFunction<Env> = async (context) => {
  const now = Date.now()

  const proxyTtl = Number(context.env.SCRAPBOX_PROXY_TTL)

  const path = Array.isArray(context.params.path)
    ? context.params.path.join('/')
    : context.params.path

  const currentUrl = new URL(context.request.url)

  const upstreamUrl = new URL(`/api/${path}`, 'https://scrapbox.io')
  upstreamUrl.search = currentUrl.search

  const request = new Request(upstreamUrl.toString(), {
    method: context.request.method,
    headers: [...context.request.headers.entries()].filter(([name]) =>
      ALLOWED_REQUEST_HEADERS.includes(name.toLowerCase()),
    ),
  })

  const key = await digestRequest(request)

  const cached = cache.get(key)
  if (cached) {
    return new Response(cached.body, {
      status: cached.status,
      headers: {
        ...cached.headers.entries(),
        'X-Cache': 'HIT',
      },
    })
  }

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

  cache.set(key, {
    created: now,
    status: response.status,
    headers: response.headers,
    body: await response.clone().arrayBuffer(),
  })

  return new Response(response.body, {
    status: response.status,
    headers: {
      ...Object.fromEntries(sanitzeResponseHeaders(response.headers)),
      'X-Cache': 'MISS',
    },
  })
}
