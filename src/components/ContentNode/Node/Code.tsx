import styles from './Code.module.css'

type Props = Readonly<{
  children: string
}>

export function Code({ children }: Props): React.ReactNode {
  return <code className={styles.code}>{children}</code>
}
