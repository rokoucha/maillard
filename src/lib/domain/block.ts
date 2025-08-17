import * as cosense from '@progfay/scrapbox-parser'
import { SCRAPBOX_PROJECT } from '../env'

type BaseNode = {
  raw: string
}

export type IconNode = cosense.IconNode & {
  src: string
}

export type StrongIconNode = cosense.StrongIconNode & {
  src: string
}

export type QuoteNode = BaseNode & {
  type: 'quote'
  nodes: Node[]
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

export {
  type BlankNode,
  type CodeNode,
  type CommandLineNode,
  type FormulaNode,
  type GoogleMapNode,
  type HashTagNode,
  type HelpfeelNode,
  type ImageNode,
  type LinkNode,
  type PlainNode,
  type StrongImageNode,
} from '@progfay/scrapbox-parser'

type Line = {
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

export type NodeType = Node['type']

type NodeProcessorFunction = (node: Node) => Promise<Node | null>

export type NodeProcessor = {
  types: NodeType[]
  processor: NodeProcessorFunction
}

export async function processBlocks(
  blocks: Block[],
  processors: NodeProcessor[],
): Promise<Block[]> {
  const processorMap = new Map<NodeType, NodeProcessorFunction[]>()

  for (const { types, processor } of processors) {
    for (const type of types) {
      const processors = processorMap.get(type) ?? []
      processorMap.set(type, [...processors, processor])
    }
  }

  return await Promise.all(
    blocks.map(async (b) => {
      switch (b.type) {
        case 'line':
          return {
            ...b,
            nodes: await processNodes(b.nodes, processorMap),
          }

        case 'table':
          return {
            ...b,
            cells: await Promise.all(
              b.cells.map(
                async (row) =>
                  await Promise.all(
                    row.map(
                      async (cell) => await processNodes(cell, processorMap),
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

export async function processNodes(
  nodes: Node[],
  processors: Map<NodeType, NodeProcessorFunction[]>,
): Promise<Node[]> {
  return await Promise.all(
    nodes.map(async (node): Promise<Node | null> => {
      let processedNode: Node | null = node

      const p = processors.get(node.type)
      if (p) {
        processedNode = await p.reduce<Promise<Node | null>>(
          async (acc, processor) => {
            const a = await acc
            if (!a) return null
            return processor(a)
          },
          Promise.resolve(processedNode),
        )
      }

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

async function convertScrapboxParserNodeToMaillardNode(
  node: Node,
): Promise<Node | null> {
  const n = node as cosense.Node

  switch (n.type) {
    case 'icon':
    case 'strongIcon':
      return {
        ...n,
        src:
          n.pathType === 'relative'
            ? `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${n.path}/icon`
            : `https://scrapbox.io/api/pages${n.path}/icon`,
      }

    default:
      return n as Node
  }
}

export type ParserOption = cosense.ParserOption & {
  processors?: NodeProcessor[]
}

export async function parse(
  input: string[],
  options?: ParserOption,
): Promise<Block[]> {
  let { processors, ...opts } = options ?? {}
  const parsed = cosense.parse(input.join('\n'), opts)

  processors = processors ?? []

  return await processBlocks(parsed as Block[], [
    {
      types: ['icon', 'strongIcon'],
      processor: convertScrapboxParserNodeToMaillardNode,
    },
    ...processors,
  ])
}
