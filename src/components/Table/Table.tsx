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
          {cells.map((row) => (
            <tr>
              {row.map((cell) => (
                <td>
                  {cell.map((c) => (
                    <ContentNode node={c} />
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
