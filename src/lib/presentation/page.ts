import * as cosense from '@progfay/scrapbox-parser'
import { type Page } from '../domain/page'
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
    blocks: await processBlocks(
      page.blocks as Block[],
      convertScrapboxParserNodeToMaillardNode(pageInfo),
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

function convertScrapboxParserNodeToMaillardNode(
  pageInfo: Map<string, PageInfo>,
) {
  return async (node: Node): Promise<Node> => {
    const n = node as cosense.Node

    switch (n.type) {
      case 'icon':
      case 'strongIcon':
        const page = pageInfo.get(n.path)

        switch (n.pathType) {
          case 'relative':
            return {
              type: n.type,
              raw: n.raw,
              pathType: page ? 'internal' : 'external',
              href: page
                ? `/${n.path}`
                : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${n.path}`,
              src: `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${n.path}/icon`,
            } satisfies IconNode | StrongIconNode

          case 'root':
            return {
              type: n.type,
              raw: n.raw,
              pathType: 'external',
              href: `https://scrapbox.io${n.path}`,
              src: `https://scrapbox.io/api/pages${n.path}/icon`,
            } satisfies IconNode | StrongIconNode
        }

      case 'link':
        switch (n.pathType) {
          case 'relative':
            return {
              type: 'link',
              raw: n.raw,
              pathType: 'internal',
              href: `/${n.href}`,
              content: n.content,
            } satisfies LinkNode

          case 'absolute':
            return {
              type: 'link',
              raw: n.raw,
              pathType: 'external',
              href: n.href,
              content: n.content,
            } satisfies LinkNode

          case 'root':
            return {
              type: 'link',
              raw: n.raw,
              pathType: 'external',
              href: `https://scrapbox.io${n.href}`,
              content: n.content,
            } satisfies LinkNode
        }

      case 'hashTag':
        return {
          type: 'hashTag',
          raw: n.raw,
          pathType: 'internal',
          href: n.href,
          content: n.href,
        } satisfies HashTagNode

      default:
        return n as Node
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

export {
  type BlankNode,
  type CodeNode,
  type CommandLineNode,
  type FormulaNode,
  type GoogleMapNode,
  type HelpfeelNode,
  type ImageNode,
  type PlainNode,
  type StrongImageNode,
} from '@progfay/scrapbox-parser'

export type Line = {
  indent: number
  type: 'line'
  nodes: Node[]
}

export type Table = {
  indent: number
  type: 'table'
  fileName: string
  cells: Node[][][]
}

export type Block = cosense.CodeBlock | Table | Line

async function processBlocks(
  blocks: Block[],
  processor: (node: Node) => Promise<Node>,
): Promise<Block[]> {
  return await Promise.all(
    blocks.map(async (b) => {
      switch (b.type) {
        case 'line':
          return {
            ...b,
            nodes: await processNodes(b.nodes, processor),
          }

        case 'table':
          return {
            ...b,
            cells: await Promise.all(
              b.cells.map(
                async (row) =>
                  await Promise.all(
                    row.map(
                      async (cell) => await processNodes(cell, processor),
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

async function processNodes(
  nodes: Node[],
  processor: (node: Node) => Promise<Node>,
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
            nodes: await processNodes(processedNode.nodes, processor),
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
