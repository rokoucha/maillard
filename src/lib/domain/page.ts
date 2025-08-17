import * as cosense from '@progfay/scrapbox-parser'
import { SCRAPBOX_PROJECT } from '../env'

export type Page = {
  id: string
  title: string
  image: string | null
  description: Node[]
  created: Date
  updated: Date
  persistent: boolean
  blocks: Block[]
  links: string[]
  relatedPages: {
    direct: RelatedPage[]
    indirect: RelatedPage[]
  }
}

export type RelatedPage = {
  id: string
  title: string
  image: string | null
  description: Node[]
  created: Date
  updated: Date
  links: string[]
}

export async function parseDescription(
  descriptions: string[],
): Promise<Node[]> {
  const nodes =
    cosense
      .parse(descriptions.join('\n'), { hasTitle: false })
      .find((b) => b.type === 'line')?.nodes ?? []

  return await processNodes(nodes as Node[], [convertCosenseNodeToDomainNode])
}

export async function parseLines(lines: string[]): Promise<Block[]> {
  const blocks = cosense.parse(lines.join('\n'))

  return await processBlocks(blocks as Block[], [
    convertCosenseNodeToDomainNode,
  ])
}

async function convertCosenseNodeToDomainNode(node: Node): Promise<Node> {
  const n = node as cosense.Node

  switch (n.type) {
    case 'strongIcon':
    case 'icon':
      return {
        ...n,
        src:
          n.pathType === 'relative'
            ? `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${n.path}/icon`
            : `https://scrapbox.io/api/pages${n.path}/icon`,
      } satisfies StrongIconNode | IconNode

    default:
      return n as Node
  }
}

type BaseNode = {
  raw: string
}

export type QuoteNode = BaseNode & {
  type: 'quote'
  nodes: Node[]
}

export type StrongIconNode = cosense.StrongIconNode & {
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

export type IconNode = cosense.IconNode & {
  src: string
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
  | cosense.LinkNode
  | cosense.GoogleMapNode
  | IconNode
  | cosense.HashTagNode
  | NumberListNode
  | cosense.PlainNode

export type CosenseNode = cosense.Node

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

export type Block = cosense.CodeBlock | cosense.Title | Table | Line

type Processor = (node: Node) => Promise<Node | null>

export async function processBlocks(
  blocks: Block[],
  processors: Processor[],
): Promise<Block[]> {
  return await Promise.all(
    blocks.map(async (b) => {
      switch (b.type) {
        case 'line':
          return {
            ...b,
            nodes: await processNodes(b.nodes, processors),
          }

        case 'table':
          return {
            ...b,
            cells: await Promise.all(
              b.cells.map(
                async (row) =>
                  await Promise.all(
                    row.map(
                      async (cell) => await processNodes(cell, processors),
                    ),
                  ),
              ),
            ),
          }

        default:
          return b
      }
    }),
  )
}

export async function processNodes(
  nodes: Node[],
  processors: Processor[],
): Promise<Node[]> {
  return await Promise.all(
    nodes.map(async (node): Promise<Node | null> => {
      const processedNode = await processors.reduce<Promise<Node | null>>(
        async (acc, processor) => {
          const current = await acc
          if (!current) return null
          return processor(current)
        },
        Promise.resolve(node),
      )

      if (!processedNode) {
        return null
      }

      switch (processedNode.type) {
        case 'decoration':
        case 'numberList':
        case 'quote':
        case 'strong':
          const n = await processNodes(processedNode.nodes, processors)

          if (n.length === 0) {
            return null
          }

          return {
            ...processedNode,
            nodes: n,
          }

        default:
          return processedNode
      }
    }),
  ).then((n) => n.filter((n): n is Node => n !== null))
}
