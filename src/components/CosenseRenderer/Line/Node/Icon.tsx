import clsx from 'clsx'
import styles from './Icon.module.css'

type Props = Readonly<{
  href: string
  path: string
  src: string
  strong?: boolean | undefined
}>

export function Icon({
  href,
  path,
  src,
  strong = false,
}: Props): React.ReactNode {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <img
        alt={path}
        className={clsx(styles.icon, { [styles.strong]: strong })}
        decoding="async"
        loading="lazy"
        src={src}
      />
    </a>
  )
}
