import clsx from 'clsx'
import NextLink from 'next/link'
import styles from './Link.module.css'

type Props = Readonly<{
  children: React.ReactNode
  external: boolean
  href: string
}>

export function Link({ children, external, href }: Props): React.ReactNode {
  return (
    <NextLink
      className={clsx(styles.link, { [styles.external]: external })}
      href={href}
      {...(external ? { target: '_blank' } : {})}
    >
      {children}
    </NextLink>
  )
}
