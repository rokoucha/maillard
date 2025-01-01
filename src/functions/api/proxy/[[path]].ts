interface Env {
  D1: D1Database
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
  console.log({
    key,
    proxyTtl,
    now,
    created: cached?.created,
  })
  if (cached && now - cached.created <= proxyTtl) {
    return new Response(cached.body, {
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

  await context.env.D1.prepare(
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

  return new Response(response.body, {
    status: response.status,
    headers: {
      ...Object.fromEntries(sanitzeResponseHeaders(response.headers)),
      'X-Cache': 'MISS',
    },
  })
}
