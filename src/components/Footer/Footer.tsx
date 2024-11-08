import styles from './Footer.module.css'

type Props = Readonly<{
  name: string
  version: string
}>

export function Footer({ name, version }: Props): React.ReactNode {
  return (
    <footer className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.powered_by}>
          <pre>
            {name}/{version}
          </pre>
        </div>
      </div>
    </footer>
  )
}
