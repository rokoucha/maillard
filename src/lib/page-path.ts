import { escapePageTitleForPath } from './escape'

const MAX_DECODE_ATTEMPTS = 2

export function pagePathFromTitle(title: string) {
  return `/${escapePageTitleForPath(title)}`
}

export function pageUrlFromPath(baseUrl: string | URL, pagePath: string) {
  return new URL(pagePath.slice(1), baseUrl).toString()
}

export function resolvePageTitleFromSlugParts(slugParts: string[]) {
  const candidates = resolvePageTitleCandidatesFromPathname(
    `/${slugParts.join('/')}`,
  )
  return candidates.at(-1) ?? null
}

export function resolvePageTitleCandidatesFromPathname(pathname: string) {
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
