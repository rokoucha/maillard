import styles from './StrongImage.module.css'

type Props = Readonly<{
  src: string
}>

export function StrongImage({ src }: Props): React.ReactNode {
  return <img className={styles.strong_image} src={src} />
}
