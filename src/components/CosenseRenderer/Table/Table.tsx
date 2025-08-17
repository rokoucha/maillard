import { type Node } from '../../../lib/presentation/page'
import { Line } from '../Line'
import styles from './Table.module.css'

type TableProps = Readonly<{
  cells: Node[][][]
  filename: string
  href: string
}>

export function Table({ cells, filename, href }: TableProps): React.ReactNode {
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
                    <Line key={i} node={c} />
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
