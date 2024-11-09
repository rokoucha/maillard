import styles from './Icon.module.css'

type Props = Readonly<{
  href: string
  path: string
  src: string
}>

export function Icon({ href, path, src }: Props): React.ReactNode {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <img className={styles.icon} src={src} alt={path} />
    </a>
  )
}
