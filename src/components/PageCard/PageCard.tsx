import clsx from 'clsx'
import Link from 'next/link'
import { RelatedPage } from '../../schema/scrapbox'
import styles from './PageCard.module.css'

export type Props = Readonly<{
  className?: string | undefined
  page: RelatedPage
}>

export function PageCard({ className, page }: Props): React.ReactNode {
  const createdAt = new Date(page.created * 1000)
  const description = page.descriptions.join(' ')

  return (
    <article className={clsx(styles.wrapper, className)}>
      <Link href={`/${encodeURIComponent(page.title)}`}>
        {page.image ? (
          <img alt={page.title} className={styles.thumbnail} src={page.image} />
        ) : (
          <span className={styles.thumbnail_alt}>📄</span>
        )}
      </Link>
      <div className={styles.container}>
        <header>
          <Link href={`/${encodeURIComponent(page.title)}`}>
            <h1 className={styles.title_text}>{page.title}</h1>
          </Link>
          <time className={styles.date_text}>
            {createdAt.getFullYear()}-
            {String(createdAt.getMonth() + 1).padStart(2, '0')}-
            {String(createdAt.getDate()).padStart(2, '0')}
          </time>
        </header>
        <section>
          <p className={styles.description_text}>{description}</p>
        </section>
        <footer>
          <ul className={styles.link_list}>
            {page.linksLc?.map((title) => (
              <li key={title}>
                <Link
                  className={styles.link}
                  href={`/${encodeURIComponent(title)}`}
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </article>
  )
}
