import * as cosense from '../cosense'
import {
  parseDescription,
  parseLines,
  type Page,
  type PageSummary,
  type RelatedPage,
} from '../domain/page'

function normalizeImage(image: string | null | undefined): string | null {
  if (!image) return null
  return image.startsWith('https://i.gyazo.com')
    ? image.replace(/\/raw$/, '')
    : image
}

export async function findSummaryByTitle(
  title: string,
): Promise<PageSummary | null> {
  const page = await cosense.page(title)
  if (!page) {
    return null
  }

  return {
    id: page.id,
    title: page.title,
    image: normalizeImage(page.image),
    description: await parseDescription(page.descriptions),
    created: new Date(page.created * 1000),
    updated: new Date(page.updated * 1000),
    links: page.links,
  }
}

export async function findByTitle(
  title: string,
  titleLcMap: Map<string, string> = new Map(),
): Promise<Page | null> {
  const page = await cosense.page(title)
  if (!page) {
    return null
  }

  const direct: RelatedPage[] = await Promise.all(
    page.relatedPages.links1hop.map(async (link) => ({
      id: link.id,
      title: link.title,
      image: normalizeImage(link.image),
      description: await parseDescription(link.descriptions),
      created: new Date(link.created * 1000),
      updated: new Date(link.updated * 1000),
      links: link.linksLc.map((lc) => titleLcMap.get(lc) ?? lc),
    })),
  )

  const indirect: RelatedPage[] = await Promise.all(
    page.relatedPages.links2hop.map(async (link) => ({
      id: link.id,
      title: link.title,
      image: normalizeImage(link.image),
      description: await parseDescription(link.descriptions),
      created: new Date(link.created * 1000),
      updated: new Date(link.updated * 1000),
      links: link.linksLc.map((lc) => titleLcMap.get(lc) ?? lc),
    })),
  )

  return {
    id: page.id,
    title: page.title,
    image: normalizeImage(page.image),
    description: await parseDescription(page.descriptions),
    created: new Date(page.created * 1000),
    updated: new Date(page.updated * 1000),
    persistent: page.persistent,
    blocks: await parseLines(page.lines.map((l) => l.text)),
    links: page.links,
    relatedPages: {
      direct,
      indirect,
    },
  }
}
