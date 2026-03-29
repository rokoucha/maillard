/**
 * ベース URL に相対パスを追加し、`base` のトレイリングスラッシュを正規化することで、
 * `base` の最後のパスセグメントが常に保持される。
 *
 * 例:
 *   buildUrl('https://scrapbox.io/',        'api/pages/proj/foo')
 *     => 'https://scrapbox.io/api/pages/proj/foo'
 *   buildUrl('https://scrapbox.io',         'api/pages/proj/foo')
 *     => 'https://scrapbox.io/api/pages/proj/foo'
 *   buildUrl('https://proxy.example.com/v1/', 'api/pages/proj/foo')
 *     => 'https://proxy.example.com/v1/api/pages/proj/foo'
 *   buildUrl('https://proxy.example.com/v1',  'api/pages/proj/foo')
 *     => 'https://proxy.example.com/v1/api/pages/proj/foo'
 */
export function buildUrl(base: string, relativePath: string): URL {
  const normalizedBase = base.endsWith('/') ? base : base + '/'
  const normalizedPath = relativePath.startsWith('/')
    ? relativePath.slice(1)
    : relativePath
  return new URL(normalizedBase + normalizedPath)
}

/**
 * 絶対 URL のオリジン+パスを `fromBase` から `toBase` へ書き換える。
 *
 * 内部画像 URL を別のベースでプロキシするときに使用する。
 * `fromBase` と `toBase` が末尾スラッシュを持たない場合は、自動的に追加される。
 *
 * 例:
 *   rebaseUrl(
 *     'https://scrapbox.io/files/proj/img.png',
 *     'https://scrapbox.io/',
 *     'https://proxy.example.com/',
 *   ) => URL('https://proxy.example.com/files/proj/img.png')
 */
export function rebaseUrl(
  absoluteUrl: string,
  fromBase: string,
  toBase: string,
): URL {
  const normalizedFrom = fromBase.endsWith('/') ? fromBase : fromBase + '/'
  const normalizedTo = toBase.endsWith('/') ? toBase : toBase + '/'

  if (!absoluteUrl.startsWith(normalizedFrom)) {
    throw new Error(`URL does not start with fromBase: ${absoluteUrl}`)
  }

  const relativePath = absoluteUrl.slice(normalizedFrom.length)
  return buildUrl(normalizedTo, relativePath)
}
