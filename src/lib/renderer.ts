import { Node, parse } from '@progfay/scrapbox-parser'

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
          return node.content
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
    .map((b): string => {
      switch (b.type) {
        case 'codeBlock':
          return b.content

        case 'line':
          return nodesToText(b.nodes)

        case 'table':
          return b.cells
            .flatMap((row) => row.map((cell) => nodesToText(cell)))
            .join('')

        case 'title':
          return ''

        default:
          throw new Error(
            `Unknown block type: ${(b satisfies never as any).type}`,
          )
      }
    })
    .filter((s) => s !== '')
    .join(' ')
    .trim()
}
