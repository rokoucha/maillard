import { cache } from 'react'
import {
  type Page,
  type PageInfo,
  type RelatedPage,
} from '../../schema/cosense'
import * as cosense from '../cosense'
import { digestSHA1 } from '../digest'
import { SCRAPBOX_COLLECT_PAGE, SCRAPBOX_INDEX_PAGE } from '../env'
import { type InternalImage } from '../model/internalimage'
import { descriptionsToText, nodesToImages, parse } from '../parser'

const getPageList = cache(async function getPageList(): Promise<PageInfo[]> {
  const pages = await cosense.searchTitles()
  const infos = pages
    .map((p) => ({
      id: p.id,
      title: p.title,
      links: p.links,
      updated: new Date(p.updated * 1000),
      image: p.image ?? null,
    }))
    .filter((t) => {
      // 全公開なら何もフィルタしない
      if (!SCRAPBOX_COLLECT_PAGE) {
        return true
      }

      // 以下は一部公開のフィルタリング

      // トップページと収集ページが別な場合は、収集ページはフィルタして隠す
      if (
        SCRAPBOX_COLLECT_PAGE !== SCRAPBOX_INDEX_PAGE &&
        t.title === SCRAPBOX_COLLECT_PAGE
      ) {
        return false
      }

      // 収集ページがリンクに含まれていない場合はフィルタする
      if (!t.links.includes(SCRAPBOX_COLLECT_PAGE)) {
        return false
      }

      return true
    })

  return infos.sort((a, b) => b.updated.getTime() - a.updated.getTime())
})

export const getPage = cache(async function getPage(
  title: string,
): Promise<Page | null> {
  const page = await cosense.page(title)
  if (!page) {
    return null
  }

  if (
    SCRAPBOX_COLLECT_PAGE &&
    page.title !== SCRAPBOX_COLLECT_PAGE &&
    !page.links.includes(SCRAPBOX_COLLECT_PAGE)
  ) {
    return null
  }

  const pages = await getPageList()
  const pagesMap = new Map(pages.map((i) => [i.title, i]))

  const links = page.links.filter((l) => {
    if (!SCRAPBOX_COLLECT_PAGE) {
      return true
    }

    return pagesMap.has(l)
  })

  const relatedPages: RelatedPage[] = []
  // 1hop
  for (const link of page.relatedPages.links1hop) {
    if (link.title === page.title) {
      continue
    }

    if (link.title === SCRAPBOX_COLLECT_PAGE) {
      continue
    }

    // 一部公開なら公開対象に含まれない場合はフィルタする
    if (SCRAPBOX_COLLECT_PAGE && !pagesMap.has(link.title)) {
      continue
    }

    const related = await cosense.page(link.title)
    if (!related) {
      throw new Error(`Page not found: ${link.title}`)
    }

    relatedPages.push({
      id: related.id,
      title: related.title,
      image: related.image,
      description: descriptionsToText(related.descriptions),
      created: new Date(related.created * 1000),
      updated: new Date(related.updated * 1000),
      links: related.links.filter((l) => {
        // 全公開なら何もフィルタしない
        if (!SCRAPBOX_COLLECT_PAGE) {
          return true
        }

        // 一部公開で公開対象に含まれない場合はフィルタする
        return pagesMap.has(l)
      }),
    })
  }

  // 2hop
  for (const link of page.relatedPages.links2hop) {
    if (link.title === page.title) {
      continue
    }

    if (link.title === SCRAPBOX_COLLECT_PAGE) {
      continue
    }

    // 一部公開で公開対象に含まれない場合はフィルタする
    const pageInfo = pagesMap.get(link.title)
    if (SCRAPBOX_COLLECT_PAGE && !pageInfo) {
      continue
    }

    // 一部公開で収集ページ以外にリンクがない場合はスキップ
    if (!relatedPages.some((p) => link.linksLc.includes(p.title))) {
      continue
    }

    const related = await cosense.page(link.title)
    if (!related) {
      throw new Error(`Page not found: ${link.title}`)
    }

    relatedPages.push({
      id: related.id,
      title: related.title,
      image: related.image,
      description: descriptionsToText(related.descriptions),
      created: new Date(related.created * 1000),
      updated: new Date(related.updated * 1000),
      links: related.links.filter((l) => {
        // 全公開なら何もフィルタしない
        if (!SCRAPBOX_COLLECT_PAGE) {
          return true
        }

        // 一部公開で公開対象に含まれない場合はフィルタする
        return pagesMap.has(l)
      }),
    })
  }

  return {
    id: page.id,
    title: page.title,
    image: page.image,
    description: descriptionsToText(page.descriptions),
    pin: page.pin === 1,
    created: new Date(page.created * 1000),
    updated: new Date(page.updated * 1000),
    persistent: page.persistent,
    blocks: parse(page.lines.map((l) => l.text).join('\n')),
    links,
    icons: page.icons,
    files: page.files,
    relatedPages,
    externalLinks: [],
  }
})

export const getPages = cache(async function getPages(): Promise<Page[]> {
  const list = await getPageList()
  const pages: Page[] = []
  for (const p of list) {
    const page = await getPage(p.title)
    if (!page) {
      throw new Error(`Page not found: ${p.title}`)
    }

    pages.push(page)
  }

  return pages.sort((a, b) => b.created.getTime() - a.created.getTime())
})

export const getInternalImage = cache(async function getInternalImage(
  url: string,
): Promise<InternalImage | null> {
  const image = await cosense.fetchInternalImage(url)
  if (!image) {
    return null
  }

  const hash = await digestSHA1(url)

  let extension = ''
  switch (image.contentType) {
    case 'image/apng':
      extension = '.apng'
      break
    case 'image/avif':
      extension = '.avif'
      break
    case 'image/gif':
      extension = '.gif'
      break
    case 'image/jpeg':
      extension = '.jpg'
      break
    case 'image/png':
      extension = '.png'
      break
    case 'image/svg+xml':
      extension = '.svg'
      break
    case 'image/webp':
      extension = '.webp'
      break
    default:
      extension = '.bin'
  }

  return {
    name: `${hash}.${extension}`,
    url,
    image: image.body,
  }
})

export const getInternalImages = cache(
  async function getInternalImages(): Promise<InternalImage[]> {
    const pages = await getPages()
    const images = pages.flatMap((p) =>
      p.blocks.flatMap((b) => {
        switch (b.type) {
          case 'line':
            return nodesToImages(b.nodes, [])

          case 'table':
            return b.cells.flatMap((row) =>
              row.flatMap((cell) => nodesToImages(cell, [])),
            )

          default:
            return []
        }
      }),
    )

    return await Promise.all(
      images
        .filter((i) => cosense.isInternalUrl(i))
        .map((i) => getInternalImage(i)),
    ).then((i) => i.filter((i): i is InternalImage => i !== null))
  },
)
