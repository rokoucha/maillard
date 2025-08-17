import * as cosense from '../cosense'
import {
  parseDescription,
  parseLines,
  type Page,
  type RelatedPage,
} from '../domain/page'

export async function findByTitle(title: string): Promise<Page | null> {
  const page = await cosense.page(title)
  if (!page) {
    return null
  }

  const direct: RelatedPage[] = []
  for (const link of page.relatedPages.links1hop) {
    const related = await cosense.page(link.title)
    if (!related) {
      continue
    }

    direct.push({
      id: related.id,
      title: related.title,
      image: related.image,
      description: await parseDescription(related.descriptions),
      created: new Date(related.created * 1000),
      updated: new Date(related.updated * 1000),
      links: related.links,
    })
  }

  const indirect: RelatedPage[] = []
  for (const link of page.relatedPages.links2hop) {
    const related = await cosense.page(link.title)
    if (!related) {
      continue
    }

    indirect.push({
      id: related.id,
      title: related.title,
      image: related.image,
      description: await parseDescription(related.descriptions),
      created: new Date(related.created * 1000),
      updated: new Date(related.updated * 1000),
      links: related.links,
    })
  }

  return {
    id: page.id,
    title: page.title,
    image: page.image,
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
