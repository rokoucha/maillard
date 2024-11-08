import styles from './Header.module.css'

type Props = Readonly<{
  siteName: string
}>

export function Header({ siteName }: Props): React.ReactNode {
  return (
    <header className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <a className={styles.brand_link} href="/">
            <h1 className={styles.brand_name}>{siteName}</h1>
          </a>
        </div>
      </div>
    </header>
  )
}
