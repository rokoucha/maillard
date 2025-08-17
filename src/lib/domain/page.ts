import { parse, type Block, type Node } from '@progfay/scrapbox-parser'

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

export { type Node }

export function parseDescription(descriptions: string[]): Node[] {
  return (
    parse(descriptions.join('\n'), { hasTitle: false }).find(
      (b) => b.type === 'line',
    )?.nodes ?? []
  )
}

export function parseLines(lines: string[]): Block[] {
  return parse(lines.join('\n'))
}

export async function processBlocks(
  blocks: Block[],
  processor: (node: Node) => Promise<Node | null>,
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
        case 'title':
          return b
      }
    }),
  )
}

export async function processNodes(
  nodes: Node[],
  processor: (node: Node) => Promise<Node | null>,
): Promise<Node[]> {
  return await Promise.all(
    nodes.map(async (node): Promise<Node | null> => {
      const processedNode = await processor(node)

      if (!processedNode) {
        return null
      }

      switch (processedNode.type) {
        case 'decoration':
        case 'numberList':
        case 'quote':
        case 'strong':
          const n = await processNodes(processedNode.nodes, processor)

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
