import styles from './Main.module.css'

type Props = Readonly<{
  children: React.ReactNode
}>

export function Main({ children }: Props): React.ReactNode {
  return (
    <main className={styles.wrapper}>
      <div className={styles.container}>{children}</div>
    </main>
  )
}
