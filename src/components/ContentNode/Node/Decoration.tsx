import { type Decoration } from '@progfay/scrapbox-parser'
import styles from './Decoration.module.css'

type Props = {
  children: React.ReactNode
  decorations: Decoration[]
}

export function Decoration({ children, decorations }: Props): React.ReactNode {
  return decorations.reduce<React.ReactNode>((acc, decoration) => {
    switch (decoration) {
      case '*-1':
        return <strong className={styles.strong_1}>{acc}</strong>
      case '*-2':
        return <strong className={styles.strong_2}>{acc}</strong>
      case '*-3':
        return <strong className={styles.strong_3}>{acc}</strong>
      case '*-4':
        return <strong className={styles.strong_4}>{acc}</strong>
      case '*-5':
        return <strong className={styles.strong_5}>{acc}</strong>
      case '*-6':
        return <strong className={styles.strong_6}>{acc}</strong>
      case '*-7':
        return <strong className={styles.strong_7}>{acc}</strong>
      case '*-8':
        return <strong className={styles.strong_8}>{acc}</strong>
      case '*-9':
        return <strong className={styles.strong_9}>{acc}</strong>
      case '*-10':
        return <strong className={styles.strong_10}>{acc}</strong>
      case '!':
        return acc
      case '"':
        return acc
      case '#':
        return acc
      case '%':
        return acc
      case '&':
        return acc
      case "'":
        return acc
      case '(':
        return acc
      case ')':
        return acc
      case '+':
        return acc
      case ',':
        return acc
      case '-':
        return <s>{acc}</s>
      case '.':
        return acc
      case '/':
        return <i>{acc}</i>
      case '{':
        return acc
      case '|':
        return acc
      case '}':
        return acc
      case '<':
        return acc
      case '>':
        return acc
      case '_':
        return acc
      case '~':
        return acc
      default:
        throw new Error(`Unknown decoration: ${decoration satisfies never}`)
    }
  }, children)
}
