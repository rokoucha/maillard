import * as cosense from '../cosense'
import { type Node, parse } from '../domain/block'
import { type Page, type RelatedPage } from '../domain/page'

async function parseDescription(descriptions: string[]): Promise<Node[]> {
  return await parse(descriptions, { hasTitle: false }).then(
    (b) => b.find((b) => b.type === 'line')?.nodes ?? [],
  )
}

async function replaceInternalImage(node: Node): Promise<Node | null> {
  switch (node.type) {
    default:
      return node
  }
}

export async function findByTitle(title: string): Promise<Page | null> {
  const page = await cosense.page(title)
  if (!page) {
    return null
  }

  const blocks = await parse(
    page.lines.map((l) => l.text),
    {
      processors: [
        {
          types: ['icon', 'image', 'strongIcon', 'strongImage'],
          processor: replaceInternalImage,
        },
      ],
    },
  )

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
    blocks,
    links: page.links,
    relatedPages: {
      direct,
      indirect,
    },
  }
}
