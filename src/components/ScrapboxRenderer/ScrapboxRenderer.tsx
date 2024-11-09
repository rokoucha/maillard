import { parse } from '@progfay/scrapbox-parser'
import { CodeBlock } from '../CodeBlock'
import { ContentNode } from '../ContentNode'
import { Table } from '../Table'
import styles from './ScrapboxRenderer.module.css'

type Props = Readonly<{
  text: string
}>

function IndentWrapper({
  children,
  indent,
}: {
  children: React.ReactNode
  indent: number
}): React.ReactNode {
  if (indent === 0) {
    return <div>{children}</div>
  }

  return (
    <ul style={{ paddingLeft: `${indent}rem` }} className={styles.ul}>
      <li>{children}</li>
    </ul>
  )
}

export function ScrapboxRenderer({ text }: Props): React.ReactNode {
  const parsed = parse(text)

  return parsed.map((b) => {
    switch (b.type) {
      case 'codeBlock': {
        return (
          <IndentWrapper indent={b.indent}>
            <CodeBlock content={b.content} filename={b.fileName} />
          </IndentWrapper>
        )
      }

      case 'line': {
        if (b.nodes.length === 0) {
          return <br />
        }

        return (
          <IndentWrapper indent={b.indent}>
            {b.nodes.map((n) => (
              <ContentNode node={n} />
            ))}
          </IndentWrapper>
        )
      }

      case 'table': {
        return (
          <IndentWrapper indent={b.indent}>
            <Table cells={b.cells} filename={b.fileName} />
          </IndentWrapper>
        )
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
