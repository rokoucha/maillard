import clsx from 'clsx'
import styles from './Image.module.css'

type Props = Readonly<{
  alt: string
  link?: string | undefined
  src: string
  strong?: boolean | undefined
}>

export function Image({ alt, link, src, strong }: Props): React.ReactNode {
  return (
    <a href={link}>
      <img
        alt={alt}
        className={clsx(styles.image, strong && styles.strong)}
        decoding="async"
        loading="lazy"
        src={src}
      />
    </a>
  )
}
