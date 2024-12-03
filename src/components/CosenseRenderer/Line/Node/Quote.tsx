import styles from './Quote.module.css'

type Props = Readonly<{
  children: React.ReactNode
}>

export function Quote({ children }: Props): React.ReactNode {
  return <blockquote className={styles.quote}>{children}</blockquote>
}
