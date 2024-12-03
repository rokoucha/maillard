import styles from './NumberList.module.css'

type Props = Readonly<{
  children: React.ReactNode
  number: number
}>

export function NumberList({ children, number }: Props): React.ReactNode {
  return (
    <ol className={styles.numberlist} start={number}>
      <li>{children}</li>
    </ol>
  )
}
