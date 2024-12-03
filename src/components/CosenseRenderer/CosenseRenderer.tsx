import { Block } from '@progfay/scrapbox-parser'
import { SCRAPBOX_PROJECT } from '../../lib/env'
import { PageInfo } from '../../schema/cosense'
import { CodeBlock } from './CodeBlock'
import styles from './CosenseRender.module.css'
import { Line } from './Line'
import { Table } from './Table'

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
  blocks: Block[]
  pageInfos: Map<string, PageInfo>
  title: string
}>

export function CosenseRenderer({
  blocks,
  pageInfos,
  title,
}: Props): React.ReactNode {
  return blocks.map((b, i) => {
    switch (b.type) {
      case 'codeBlock': {
        const [[_, filename, extension]] = [
          ...b.fileName.matchAll(/^(.*?)(?:\(([^)]+)\))?$/g),
        ]

        return (
          <IndentWrapper key={i} indent={b.indent}>
            <CodeBlock
              content={b.content}
              extension={extension}
              filename={filename}
              href={`https://scrapbox.io/api/code/${SCRAPBOX_PROJECT}/${title}/${filename}`}
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
              <Line
                key={i}
                node={n}
                pageInfos={pageInfos}
                root={i === 0 && b.indent === 0}
              />
            ))}
          </IndentWrapper>
        )
      }

      case 'table': {
        return (
          <IndentWrapper key={i} indent={b.indent}>
            <Table
              cells={b.cells}
              filename={b.fileName}
              href={`https://scrapbox.io/api/table/${SCRAPBOX_PROJECT}/${title}/${b.fileName}.csv`}
              pageInfos={pageInfos}
            />
          </IndentWrapper>
        )
      }

      case 'title': {
        return false
      }

      default: {
        throw new Error(
          `Unknown block type: ${(b satisfies never as any).type}`,
        )
      }
    }
  })
}
