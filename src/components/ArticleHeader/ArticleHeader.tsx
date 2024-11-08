import styles from './ArticleHeader.module.css'

type Props = Readonly<{
  createdAt: Date
  title: string
  updatedAt: Date
}>

export function ArticleHeader({
  createdAt,
  title,
  updatedAt,
}: Props): React.ReactNode {
  return (
    <header className={styles.wrapper}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.info_container}>
        <div className={styles.info}>
          <span className={styles.info_label}>created at</span>
          <time>
            {createdAt.getFullYear()}-
            {String(createdAt.getMonth() + 1).padStart(2, '0')}-
            {String(createdAt.getDate()).padStart(2, '0')}
          </time>
        </div>
        <div className={styles.info}>
          <span className={styles.info_label}>updated at</span>
          <time>
            {updatedAt.getFullYear()}-
            {String(updatedAt.getMonth() + 1).padStart(2, '0')}-
            {String(updatedAt.getDate()).padStart(2, '0')}
          </time>
        </div>
      </div>
    </header>
  )
}
