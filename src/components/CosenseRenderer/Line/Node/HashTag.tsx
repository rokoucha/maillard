import styles from './HashTag.module.css'

type Props = Readonly<{
  children: string
  href: string
  type: 'external' | 'internal'
}>

export function HashTag({ children, href, type }: Props): React.ReactNode {
  return (
    <a
      className={styles.hashtag}
      href={href}
      {...(type === 'external' ? { target: '_blank' } : {})}
    >
      {children}
    </a>
  )
}
