import { Node } from '@progfay/scrapbox-parser'
import { ContentNode } from '../ContentNode/ContentNode'

type TableProps = Readonly<{
  cells: Node[][][]
  filename: string
}>

export function Table({ cells, filename }: TableProps): React.ReactNode {
  return (
    <div>
      <table>
        <caption>{filename}</caption>
        <tbody>
          {cells.map((row, i) => (
            <tr key={i}>
              {row.map((cell, i) => (
                <td key={i}>
                  {cell.map((c, i) => (
                    <ContentNode key={i} node={c} />
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
