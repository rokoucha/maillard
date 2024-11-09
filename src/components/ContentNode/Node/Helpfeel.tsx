import styles from './Helpfeel.module.css'

type Props = Readonly<{
  children: string
}>

export function Helpfeel({ children }: Props): React.ReactNode {
  return <span className={styles.helpfeel}>{children}</span>
}
