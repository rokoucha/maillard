import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import styles from './Code.module.css'

type Props = Readonly<{
  children: string
}>

export function Code({ children }: Props): React.ReactNode {
  const code = hljs.highlightAuto(children)

  return (
    <code
      className={styles.code}
      dangerouslySetInnerHTML={{ __html: code.value }}
    />
  )
}
