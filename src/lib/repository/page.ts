import type { GetPage } from '../../schema/cosense'
import * as cosense from '../cosense'
import {
  parseDescription,
  parseLines,
  type Page,
  type RelatedPage,
} from '../domain/page'

type LinksHop = GetPage['relatedPages']['links1hop'][number]

function normalizeImage(image: string | null | undefined): string | null {
  if (!image) return null
  return image.startsWith('https://i.gyazo.com')
    ? image.replace(/\/raw$/, '')
    : image
}

export async function findPageOnly(title: string): Promise<Page | null> {
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
    persistent: page.persistent,
    blocks: await parseLines(page.lines.map((l) => l.text)),
    links: page.links,
    relatedPages: {
      direct: [],
      indirect: [],
    },
  }
}

export async function findByTitle(
  title: string,
  titleLcMap: Map<string, string>,
): Promise<Page | null> {
  const page = await cosense.page(title)
  if (!page) {
    return null
  }

  function resolveLinks(linksLc: string[]): string[] {
    return linksLc.map((lc) => titleLcMap.get(lc) ?? lc)
  }

  async function buildRelatedPage(link: LinksHop): Promise<RelatedPage> {
    return {
      id: link.id,
      title: link.title,
      image: normalizeImage(link.image),
      description: await parseDescription(link.descriptions),
      created: new Date(link.created * 1000),
      updated: new Date(link.updated * 1000),
      links: resolveLinks(link.linksLc),
    }
  }

  const direct = await Promise.all(
    page.relatedPages.links1hop.map(buildRelatedPage),
  )

  const indirect = await Promise.all(
    page.relatedPages.links2hop.map(buildRelatedPage),
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
