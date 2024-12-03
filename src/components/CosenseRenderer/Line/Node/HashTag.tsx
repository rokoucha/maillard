import styles from './HashTag.module.css'

type Props = Readonly<{
  children: string
}>

export function HashTag({ children }: Props): React.ReactNode {
  return (
    <a className={styles.hashtag} href={children}>
      {children}
    </a>
  )
}
