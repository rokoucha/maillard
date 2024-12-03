import {
  Node,
  Page,
  ParserOption,
  parse as parseScrapbox,
} from '@progfay/scrapbox-parser'
import { SCRAPBOX_COLLECT_PAGE } from './env'

export function parse(input: string, opts?: ParserOption): Page {
  const parsed = parseScrapbox(input, opts)

  return parsed.map((block) => {
    switch (block.type) {
      case 'codeBlock':
        return block

      case 'line':
        return {
          ...block,
          nodes: filterNodes(block.nodes),
        }

      case 'table':
        return {
          ...block,
          cells: block.cells.map((row) => row.map((cell) => filterNodes(cell))),
        }

      case 'title':
        return block

      default:
        throw new Error(
          `Unknown block type: ${(block satisfies never as any).type}`,
        )
    }
  })
}

export function filterNodes(nodes: Node[]): Node[] {
  return nodes
    .map((node): Node | null => {
      switch (node.type) {
        case 'blank': {
          return node
        }

        case 'code': {
          return node
        }

        case 'commandLine': {
          return node
        }

        case 'decoration': {
          const c = filterNodes(node.nodes)

          if (c.length === 0) {
            return null
          }

          return {
            ...node,
            nodes: c,
          }
        }

        case 'formula': {
          return node
        }

        case 'googleMap': {
          return node
        }

        case 'hashTag': {
          if (node.href === SCRAPBOX_COLLECT_PAGE) {
            return null
          }

          return node
        }

        case 'helpfeel': {
          return node
        }

        case 'icon': {
          return node
        }

        case 'image': {
          return node
        }

        case 'link': {
          if (node.href === SCRAPBOX_COLLECT_PAGE) {
            return null
          }

          return node
        }

        case 'numberList': {
          return {
            ...node,
            nodes: filterNodes(node.nodes),
          }
        }

        case 'plain': {
          return node
        }

        case 'quote': {
          return {
            ...node,
            nodes: filterNodes(node.nodes),
          }
        }

        case 'strong': {
          return {
            ...node,
            nodes: filterNodes(node.nodes),
          }
        }

        case 'strongIcon': {
          return node
        }

        case 'strongImage': {
          return node
        }

        default: {
          throw new Error(
            `Unknown node type: ${(node satisfies never as any).type}`,
          )
        }
      }
    })
    .filter((n): n is Node => n !== null)
}

export function nodesToText(nodes: Node[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'blank':
          return ''
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
        case 'icon':
          return ''
        case 'image':
          return ''
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
        case 'strongIcon':
          return ''
        case 'strongImage':
          return ''

        default:
          throw new Error(
            `Unknown block type: ${(node satisfies never as any).type}`,
          )
      }
    })
    .join('')
    .trim()
}

export function descriptionsToText(descriptions: string[]): string {
  return parse(descriptions.join('\n') ?? '', {
    hasTitle: false,
  })
    .map((block): string => {
      switch (block.type) {
        case 'codeBlock':
          return block.content

        case 'line':
          return nodesToText(block.nodes)

        case 'table':
          return block.cells
            .flatMap((row) => row.map((cell) => nodesToText(cell)))
            .join('')

        case 'title':
          return ''

        default:
          throw new Error(
            `Unknown block type: ${(block satisfies never as any).type}`,
          )
      }
    })
    .filter((s) => s !== '')
    .join(' ')
    .trim()
}
