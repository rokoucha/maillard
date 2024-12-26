interface Env {
  KV: KVNamespace
}

const CACHE_TTL = 60 * 5 // 5分

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

async function deriveKey(passphrase: string) {
  const salt = new TextEncoder().encode('salt')
  const iterations = 100000
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    {
      name: 'PBKDF2',
    },
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt).buffer,
      iterations,
      hash: 'SHA-256',
    },
    key,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt'],
  )
}

async function encryptResponse(key: CryptoKey, response: Response) {
  const metadata = new TextEncoder().encode(
    JSON.stringify({
      status: response.status,
      headers: Object.fromEntries(sanitzeResponseHeaders(response.headers)),
    }),
  )

  const metadataEncrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: crypto.getRandomValues(new Uint8Array(12)).buffer,
    },
    key,
    metadata,
  )

  const body = await response.arrayBuffer()

  const bodyEncrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: crypto.getRandomValues(new Uint8Array(12)).buffer,
    },
    key,
    body,
  )

  return {
    // base64 metadata
    metadata: JSON.stringify(
      btoa(
        new Uint8Array(metadataEncrypted).reduce(
          (s, b) => s + String.fromCharCode(b),
          '',
        ),
      ),
    ),
    body: bodyEncrypted,
  }
}

async function decryptResponse(
  key: CryptoKey,
  metadata: string,
  body: ArrayBuffer,
) {
  const metadataDecrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(12).buffer,
    },
    key,
    new Uint8Array(
      atob(metadata)
        .split('')
        .map((c) => c.charCodeAt(0)),
    ).buffer,
  )

  const metadataObject = JSON.parse(new TextDecoder().decode(metadataDecrypted))

  const bodyDecrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(12).buffer,
    },
    key,
    body,
  )

  return {
    metadata: metadataObject,
    body: bodyDecrypted,
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const path = Array.isArray(context.params.path)
    ? context.params.path.join('/')
    : context.params.path

  const currentUrl = new URL(context.request.url)

  const upstreamUrl = new URL(`/api/${path}`, 'https://scrapbox.io')
  upstreamUrl.search = currentUrl.search

  const request = new Request(upstreamUrl.toString(), {
    method: context.request.method,
    headers: [...context.request.headers.entries()].filter(([name]) =>
      ['accept', 'cookie', 'referer', 'user-agent'].includes(
        name.toLowerCase(),
      ),
    ),
  })

  console.log('request', request.url)

  let key: CryptoKey | null = null
  const cookie = context.request.headers.get('cookie')
  if (cookie) {
    key = await deriveKey(cookie)
  }

  console.log('key', key)

  const cacheKey = await digestRequest(request)

  console.log('cacheKey', cacheKey)

  const { value, metadata } = await context.env.KV.getWithMetadata<string>(
    cacheKey,
    'arrayBuffer',
  )

  if (value && metadata) {
    console.log('cache hit')

    if (!key) {
      console.log('return cache without decryption')

      const metadataObject = JSON.parse(metadata)
      return new Response(value, {
        status: metadataObject.status,
        headers: {
          ...metadataObject.headers,
          'X-Cache': 'HIT',
          'X-Cache-Encrypted': 'NO',
        },
      })
    }

    console.log('return cache with decryption')

    const { metadata: metadataObject, body } = await decryptResponse(
      key,
      metadata,
      value,
    )
    return new Response(body, {
      status: metadataObject.status,
      headers: {
        ...metadataObject.headers,
        'X-Cache': 'HIT',
        'X-Cache-Encrypted': 'YES',
      },
    })
  }

  console.log('cache miss, try to fetch')

  const response = await fetch(request)

  if (!response.ok) {
    console.log('fetch failed or no body', response.status)

    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(sanitzeResponseHeaders(response.headers)),
        'X-Cache': 'NO',
      },
    })
  }

  console.log('fetch success', response.status)

  if (!key) {
    const metadata = JSON.stringify({
      status: response.status,
      headers: Object.fromEntries(sanitzeResponseHeaders(response.headers)),
    })

    console.log('cache without encryption', {
      metadata: metadata.length,
      body: Number(response.headers.get('content-length')),
    })

    // cache without encryption
    await context.env.KV.put(cacheKey, await response.clone().arrayBuffer(), {
      expirationTtl: CACHE_TTL,
      metadata,
    })

    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(sanitzeResponseHeaders(response.headers)),
        'X-Cache': 'MISS',
        'X-Cache-Encrypted': 'NO',
      },
    })
  }

  console.log('encrypt cache')

  const { metadata: encryptedMetadata, body } = await encryptResponse(
    key,
    response.clone(),
  )

  console.log('cache with encryption', {
    metadata: encryptedMetadata.length,
    body: body.byteLength,
  })

  await context.env.KV.put(cacheKey, body, {
    expirationTtl: CACHE_TTL,
    metadata: encryptedMetadata,
  })

  return new Response(response.body, {
    status: response.status,
    headers: {
      ...Object.fromEntries(sanitzeResponseHeaders(response.headers)),
      'X-Cache': 'MISS',
      'X-Cache-Encrypted': 'YES',
    },
  })
}
