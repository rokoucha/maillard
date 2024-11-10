import { Node } from '@progfay/scrapbox-parser'
import { PageMinimum } from '../../schema/scrapbox'
import { ContentNode } from '../ContentNode/ContentNode'
import styles from './Table.module.css'

type TableProps = Readonly<{
  cells: Node[][][]
  filename: string
  href: string
  pages: PageMinimum[]
}>

export function Table({
  cells,
  filename,
  href,
  pages,
}: TableProps): React.ReactNode {
  return (
    <div>
      <code className={styles.filename}>
        <a className={styles.link} href={href} target="_blank">
          {filename}
        </a>
      </code>
      <table className={styles.table}>
        <tbody>
          {cells.map((row, i) => (
            <tr key={i}>
              {row.map((column, i) => (
                <td className={styles.column} key={i}>
                  {column.map((c, i) => (
                    <ContentNode key={i} node={c} pages={pages} />
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
