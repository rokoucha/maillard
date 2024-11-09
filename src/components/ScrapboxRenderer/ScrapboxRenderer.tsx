import { parse } from '@progfay/scrapbox-parser'
import { SCRAPBOX_PROJECT } from '../../lib/env'
import { CodeBlock } from '../CodeBlock'
import { ContentNode } from '../ContentNode'
import { Table } from '../Table'
import styles from './ScrapboxRenderer.module.css'

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
      <li className={styles.li}>{children}</li>
    </ul>
  )
}

type Props = Readonly<{
  text: string
  title: string
}>

export function ScrapboxRenderer({ text, title }: Props): React.ReactNode {
  const parsed = parse(text)

  return parsed.map((b, i) => {
    switch (b.type) {
      case 'codeBlock': {
        return (
          <IndentWrapper key={i} indent={b.indent}>
            <CodeBlock
              content={b.content}
              filename={b.fileName}
              href={`https://scrapbox.io/api/code/${SCRAPBOX_PROJECT}/${title}/${b.fileName}`}
            />
          </IndentWrapper>
        )
      }

      case 'line': {
        if (b.nodes.length === 0) {
          return <br key={i} />
        }

        return (
          <IndentWrapper key={i} indent={b.indent}>
            {b.nodes.map((n, i) => (
              <ContentNode key={i} node={n} />
            ))}
          </IndentWrapper>
        )
      }

      case 'table': {
        return (
          <IndentWrapper key={i} indent={b.indent}>
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
