import clsx from 'clsx'
import NextLink from 'next/link'
import styles from './Link.module.css'

type Props = Readonly<{
  children: React.ReactNode
  href: string
  type?: 'external' | 'internal' | undefined
}>

export function Link({ children, href, type }: Props): React.ReactNode {
  return (
    <NextLink
      className={clsx(styles.link, {
        [styles.external]: type === 'external',
        [styles.internal]: type === 'internal',
      })}
      href={href}
      {...(type === 'external' ? { target: '_blank' } : {})}
    >
      {children}
    </NextLink>
  )
}
