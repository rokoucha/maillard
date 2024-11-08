import { parse } from '@progfay/scrapbox-parser'
import { CodeBlock } from '../CodeBlock'
import { ContentNode } from '../ContentNode'
import { Table } from '../Table'

type Props = Readonly<{
  text: string
}>

export function ScrapboxRenderer({ text }: Props): React.ReactNode {
  const parsed = parse(text)

  return parsed.map((b, i) => {
    switch (b.type) {
      case 'codeBlock': {
        return <CodeBlock content={b.content} filename={b.fileName} />
      }

      case 'line': {
        return (
          <div>
            {b.nodes.map((n, i) => (
              <ContentNode key={i} node={n} />
            ))}
          </div>
        )
      }

      case 'table': {
        return <Table cells={b.cells} filename={b.fileName} />
      }

      case 'title': {
        return null
      }

      default: {
        throw new Error(
          `Unknown block type: ${(b satisfies never as any).type}`,
        )
      }
    }
  })
}
