import clsx from 'clsx'
import styles from './Image.module.css'

type Props = Readonly<{
  link?: string | undefined
  src: string
  strong?: boolean | undefined
}>

export function Image({ link, src, strong }: Props): React.ReactNode {
  return (
    <a href={link}>
      <img
        className={clsx(styles.image, strong && styles.strong)}
        decoding="async"
        loading="lazy"
        src={src}
      />
    </a>
  )
}
