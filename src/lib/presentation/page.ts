import { type Block, type Node } from '../domain/block'
import { type Page } from '../domain/page'

export type PageResponse = {
  id: string
  title: string
  image: string | null
  description: string
  created: Date
  updated: Date
  persistent: boolean
  blocks: Block[]
  links: string[]
  relatedPages: RelatedPage[]
}

export type RelatedPage = {
  id: string
  title: string
  image: string | null
  description: string
  created: Date
  updated: Date
  links: string[]
}

function nodesToText(nodes: Node[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'code':
          return node.text
        case 'commandLine':
          return `${node.symbol} ${node.text}`
        case 'decoration':
          return node.nodes.map((n) => nodesToText([n])).join('')
        case 'formula':
          return node.formula
        case 'googleMap':
          return node.place
        case 'hashTag':
          return '#' + node.href
        case 'helpfeel':
          return node.text
        case 'link':
          return node.content || node.href
        case 'numberList':
          return node.nodes.map((n) => nodesToText([n])).join('')
        case 'plain':
          return node.text
        case 'quote':
          return node.nodes.map((n) => nodesToText([n])).join('')
        case 'strong':
          return node.nodes.map((n) => nodesToText([n])).join('')

        default:
          return ''
      }
    })
    .join('')
    .trim()
}

export async function present(page: Page): Promise<PageResponse> {
  return {
    id: page.id,
    title: page.title,
    image: page.image,
    description: nodesToText(page.description),
    created: page.created,
    updated: page.updated,
    persistent: page.persistent,
    blocks: page.blocks,
    links: page.links,
    relatedPages: [
      ...page.relatedPages.direct,
      ...page.relatedPages.indirect,
    ].map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image,
      description: nodesToText(p.description),
      created: p.created,
      updated: p.updated,
      links: p.links,
    })),
  }
}
