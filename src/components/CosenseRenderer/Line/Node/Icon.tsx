import clsx from 'clsx'
import styles from './Icon.module.css'

type Props = Readonly<{
  href: string
  pathType: 'internal' | 'external'
  src: string
  strong?: boolean | undefined
}>

export function Icon({
  href,
  pathType,
  src,
  strong = false,
}: Props): React.ReactNode {
  return (
    <a href={href} {...(pathType === 'external' ? { target: '_blank' } : {})}>
      <img
        className={clsx(styles.icon, { [styles.strong]: strong })}
        decoding="async"
        loading="lazy"
        src={src}
      />
    </a>
  )
}
