import clsx from 'clsx'
import NextLink from 'next/link'
import { Spotify } from 'react-spotify-embed'
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
      break
    }

    case href.match(SpotifyEmbedMatcher) !== null: {
      embed = <SpotifyEmbed href={href} />
      break
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

const TwitterEmbedMatcher =
  /^https?:\/\/(?:twitter|x)\.com\/[@\w_]+\/status\/(\d+)/

type TwitterEmbedProps = Readonly<{
  href: string
}>

export function TwitterEmbed({ href }: TwitterEmbedProps): React.ReactNode {
  const id = href.match(TwitterEmbedMatcher)?.[1]
  if (!id) throw new Error('Invalid Twitter URL')

  return (
    <div className={styles.tweet_embed}>
      <Tweet id={id} />
    </div>
  )
}

const SpotifyEmbedMatcher = /^https?:\/\/open\.spotify\.com\//

type SpotifyEmbedProps = Readonly<{
  href: string
}>

export function SpotifyEmbed({ href }: SpotifyEmbedProps): React.ReactNode {
  return (
    <Spotify
      className={styles.spotify_embed}
      link={href}
      width="100%"
      wide={href.match(/track/) !== null}
    />
  )
}
