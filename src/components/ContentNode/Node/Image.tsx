import styles from './Image.module.css'

type Props = Readonly<{
  link: string
  src: string
}>

export function Image({ link, src }: Props): React.ReactNode {
  return (
    <a href={link}>
      <img className={styles.image} src={src} />
    </a>
  )
}
