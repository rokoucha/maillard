import styles from './Header.module.css'

type Props = Readonly<{
  logo?: string | undefined
  siteName: string
}>

export function Header({ logo, siteName }: Props): React.ReactNode {
  return (
    <header className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <a className={styles.brand_link} href="/">
            {logo && (
              <img className={styles.brand_logo} src={logo} alt="logo" />
            )}
            <h1 className={styles.brand_name}>{siteName}</h1>
          </a>
        </div>
      </div>
    </header>
  )
}
