import * as cosense from '@progfay/scrapbox-parser'
import { digestSHA1 } from '../digest'
import {
  type Block as DomainBlock,
  type Node as DomainNode,
  type Page,
} from '../domain/page'
import { type PageInfo } from '../domain/pageinfo'
import { SCRAPBOX_PROJECT } from '../env'

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

export async function present(
  page: Page,
  pageInfo: Map<string, PageInfo>,
): Promise<PageResponse> {
  return {
    id: page.id,
    title: page.title,
    image: page.image,
    description: nodesToText(page.description),
    created: page.created,
    updated: page.updated,
    persistent: page.persistent,
    blocks: await convertBlocks(
      page.blocks,
      convertDomainNodeToPresentationNode(pageInfo),
    ),
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

function convertDomainNodeToPresentationNode(pageInfo: Map<string, PageInfo>) {
  return async (node: DomainNode): Promise<Node> => {
    switch (node.type) {
      case 'icon':
      case 'strongIcon':
        switch (node.pathType) {
          case 'relative':
            const page = pageInfo.get(node.path)

            return {
              type: node.type,
              raw: node.raw,
              pathType: page ? 'internal' : 'external',
              href: page
                ? `/${node.path}`
                : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.path}`,
              src: node.src,
            } satisfies IconNode | StrongIconNode

          case 'root':
            return {
              type: node.type,
              raw: node.raw,
              pathType: 'external',
              href: `https://scrapbox.io${node.path}`,
              src: node.src,
            } satisfies IconNode | StrongIconNode
        }

      case 'link':
        switch (node.pathType) {
          case 'relative':
            const page = pageInfo.get(node.href)

            return {
              type: 'link',
              raw: node.raw,
              pathType: page ? 'internal' : 'external',
              href: page
                ? `/${node.href}`
                : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.href}`,
              content: node.content || node.href,
            } satisfies LinkNode

          case 'absolute':
            return {
              type: 'link',
              raw: node.raw,
              pathType: 'external',
              href: node.href,
              content: node.content || node.href,
            } satisfies LinkNode

          case 'root':
            return {
              type: 'link',
              raw: node.raw,
              pathType: 'external',
              href: `https://scrapbox.io${node.href}`,
              content: node.content || node.href,
            } satisfies LinkNode
        }

      case 'hashTag':
        const page = pageInfo.get(node.href)

        return {
          type: 'hashTag',
          raw: node.raw,
          pathType: page ? 'internal' : 'external',
          href: page
            ? `/${node.href}`
            : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.href}`,
          content: node.href,
        } satisfies HashTagNode

      case 'decoration':
        return {
          ...node,
          nodes: node.nodes as Node[],
          hash: await digestSHA1(node.raw),
        } satisfies DecorationNode

      default:
        return node as Node
    }
  }
}

type BaseNode = {
  raw: string
}

export type QuoteNode = BaseNode & {
  type: 'quote'
  nodes: Node[]
}

export type StrongIconNode = BaseNode & {
  type: 'strongIcon'
  pathType: 'internal' | 'external'
  href: string
  src: string
}

export type StrongNode = BaseNode & {
  type: 'strong'
  nodes: Node[]
}

export type DecorationNode = BaseNode & {
  type: 'decoration'
  rawDecos: string
  decos: cosense.Decoration[]
  hash: string
  nodes: Node[]
}

export type LinkNode = BaseNode & {
  type: 'link'
  pathType: 'internal' | 'external'
  href: string
  content: string
}

export type IconNode = BaseNode & {
  type: 'icon'
  pathType: 'internal' | 'external'
  href: string
  src: string
}

export type HashTagNode = BaseNode & {
  type: 'hashTag'
  pathType: 'internal' | 'external'
  href: string
  content: string
}

export type NumberListNode = BaseNode & {
  type: 'numberList'
  rawNumber: string
  number: number
  nodes: Node[]
}

export type Node =
  | QuoteNode
  | cosense.HelpfeelNode
  | cosense.StrongImageNode
  | StrongIconNode
  | StrongNode
  | cosense.FormulaNode
  | DecorationNode
  | cosense.CodeNode
  | cosense.CommandLineNode
  | cosense.BlankNode
  | cosense.ImageNode
  | LinkNode
  | cosense.GoogleMapNode
  | IconNode
  | HashTagNode
  | NumberListNode
  | cosense.PlainNode

type Line = {
  indent: number
  type: 'line'
  nodes: Node[]
}

type Table = {
  indent: number
  type: 'table'
  fileName: string
  cells: Node[][][]
}

export type Block = cosense.CodeBlock | Table | Line

async function convertBlocks(
  blocks: DomainBlock[],
  processor: (node: DomainNode) => Promise<Node>,
): Promise<Block[]> {
  return await Promise.all(
    blocks.map(async (b) => {
      switch (b.type) {
        case 'line':
          return {
            ...b,
            nodes: await convertNodes(b.nodes, processor),
          }

        case 'table':
          return {
            ...b,
            cells: await Promise.all(
              b.cells.map(
                async (row) =>
                  await Promise.all(
                    row.map(
                      async (cell) => await convertNodes(cell, processor),
                    ),
                  ),
              ),
            ),
          }

        case 'codeBlock':
          return b

        default:
          return null
      }
    }),
  ).then((b) => b.filter((b): b is Block => b !== null))
}

async function convertNodes(
  nodes: DomainNode[],
  processor: (node: DomainNode) => Promise<Node>,
): Promise<Node[]> {
  return await Promise.all(
    nodes.map(async (node) => {
      const processedNode = await processor(node)

      switch (processedNode.type) {
        case 'decoration':
        case 'numberList':
        case 'quote':
        case 'strong':
          return {
            ...processedNode,
            nodes: await convertNodes(
              processedNode.nodes as DomainNode[],
              processor,
            ),
          }

        default:
          return processedNode
      }
    }),
  )
}

function nodesToText(nodes: cosense.Node[]): string {
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
