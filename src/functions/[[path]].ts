interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

const MAX_DECODE_ATTEMPTS = 2

export type PageRouteContext = {
  request: Request
  env: {
    ASSETS: {
      fetch(request: Request): Promise<Response>
    }
  }
  next(): Promise<Response>
}

export const onRequest: PagesFunction<Env> = async (context) => {
  return handlePageRequest(context)
}

export async function handlePageRequest(
  context: PageRouteContext,
): Promise<Response> {
  const url = new URL(context.request.url)

  if (shouldBypassPageRoute(url.pathname)) {
    return context.next()
  }

  const titles = resolvePageTitleCandidatesFromPathname(url.pathname)
  if (titles.length === 0) {
    return context.next()
  }

  for (const title of titles) {
    const assetUrl = new URL(pageAssetPathFromTitle(title), url)
    assetUrl.search = url.search

    const response = await context.env.ASSETS.fetch(
      new Request(assetUrl.toString(), {
        headers: context.request.headers,
        method: context.request.method,
      }),
    )

    if (response.ok) {
      return response
    }
  }

  return context.next()
}

export function shouldBypassPageRoute(pathname: string) {
  return (
    pathname === '/' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/')
  )
}

function pageAssetPathFromTitle(title: string) {
  return `/${title
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`
}

function resolvePageTitleCandidatesFromPathname(pathname: string) {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '')
  if (!trimmed) {
    return []
  }

  const candidates: string[] = []
  let current = trimmed

  if (!candidates.includes(current)) {
    candidates.push(current)
  }

  for (let i = 0; i < MAX_DECODE_ATTEMPTS; i += 1) {
    let decoded: string | null
    try {
      decoded = decodeURIComponent(current)
    } catch {
      decoded = null
    }

    if (!decoded || decoded === current) {
      break
    }

    current = decoded
    if (!candidates.includes(current)) {
      candidates.push(current)
    }
  }

  return candidates.filter(
    (candidate) =>
      !candidate
        .split('/')
        .some((segment) => segment === '.' || segment === '..'),
  )
}
