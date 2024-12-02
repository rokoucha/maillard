import clsx from 'clsx'
import NextLink from 'next/link'
import { Tweet } from 'react-tweet'
import styles from './Link.module.css'

type Props = Readonly<{
  children: string
  href: string
  type?: 'external' | 'internal' | undefined
}>

export function Link({ children, href, type }: Props): React.ReactNode {
  let embed: React.ReactNode = false
  let prefix = ''
  switch (true) {
    case href.match(TwitterEmbedMatcher) !== null: {
      embed = <TwitterEmbed href={href} />
      if (children.startsWith('@')) {
        prefix = styles.twitter_prefix
      }
    }
  }

  return (
    <>
      {embed}
      <NextLink
        className={clsx(styles.link, prefix, {
          [styles.external]: type === 'external',
          [styles.internal]: type === 'internal',
        })}
        href={href}
        {...(type === 'external' ? { target: '_blank' } : {})}
      >
        {children}
      </NextLink>
    </>
  )
}

type TwitterEmbedProps = Readonly<{
  href: string
}>

const TwitterEmbedMatcher =
  /^https?:\/\/(?:twitter|x)\.com\/[@\w_]+\/status\/(\d+)/

export function TwitterEmbed({ href }: TwitterEmbedProps): React.ReactNode {
  const id = href.match(TwitterEmbedMatcher)?.[1]
  if (!id) throw new Error('Invalid Twitter URL')

  return (
    <div className={styles.tweet_embed}>
      <Tweet id={id} />
    </div>
  )
}
