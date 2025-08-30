import { Node, parse } from '@progfay/scrapbox-parser'
import * as cosense from '../cosense'
import { digestSHA1 } from '../digest'
import { SCRAPBOX_BASE_URL, SCRAPBOX_PROJECT } from '../env'

export async function fetchInternalImageByUrl(
  url: string,
): Promise<ArrayBuffer | null> {
  const res = await cosense.getInternalImage(url)
  if (!res.ok) {
    return null
  }

  return await res.arrayBuffer()
}

export async function resolveInternalImageByUrl(
  url: string,
): Promise<string | null> {
  const res = await cosense.headInternalImage(url)

  if (!res.ok) {
    return null
  }

  let ext: string
  switch (res.headers.get('Content-Type')) {
    case 'image/apng':
      ext = 'apng'
      break

    case 'image/avif':
      ext = 'avif'
      break

    case 'image/gif':
      ext = 'gif'
      break

    case 'image/jpeg':
      ext = 'jpg'
      break

    case 'image/png':
      ext = 'png'
      break

    case 'image/svg+xml':
      ext = 'svg'
      break

    case 'image/webp':
      ext = 'webp'
      break

    case 'image/heif':
      ext = 'heif'
      break

    case 'image/heic':
      ext = 'heic'
      break

    default:
      return null
  }

  return `${await digestSHA1(res.url)}.${ext}`
}

function collectImagesInAST(node: Node): string[] {
  switch (node.type) {
    case 'icon':
    case 'strongIcon':
      return [
        node.pathType === 'relative'
          ? `${SCRAPBOX_BASE_URL}api/pages/${SCRAPBOX_PROJECT}/${node.path}/icon`
          : `${SCRAPBOX_BASE_URL}api/pages${node.path}/icon`,
      ]

    case 'image':
    case 'strongImage':
      if (!node.src.startsWith(SCRAPBOX_BASE_URL)) {
        return []
      }
      return [node.src]

    case 'decoration':
    case 'numberList':
    case 'quote':
    case 'strong':
      return node.nodes.flatMap((n) => collectImagesInAST(n))

    default:
      return []
  }
}

export async function listImagesInPageByTitle(
  title: string,
): Promise<string[]> {
  const page = await cosense.page(title)
  if (!page) {
    return []
  }

  const blocks = parse(page.lines.map((l) => l.text).join('\n'))

  return blocks.flatMap((b) => {
    switch (b.type) {
      case 'line':
        return b.nodes.flatMap((n) => collectImagesInAST(n))

      case 'table':
        return b.cells.flatMap((r) =>
          r.flatMap((c) => c.flatMap((n) => collectImagesInAST(n))),
        )

      default:
        return []
    }
  })
}
