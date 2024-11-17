import clsx from 'clsx'
import Link from 'next/link'
import styles from './PageCard.module.css'

export type Props = Readonly<{
  className?: string | undefined
  page: {
    date: Date
    descriptions?: string[] | undefined
    title: string
    image: string | null
    links: string[]
  }
}>

export function PageCard({ className, page }: Props): React.ReactNode {
  const description = page.descriptions?.join(' ')

  return (
    <article className={clsx(styles.wrapper, className)}>
      <Link href={`/${encodeURIComponent(page.title)}`}>
        {page.image ? (
          <img
            alt={page.title}
            className={styles.thumbnail}
            decoding="async"
            loading="lazy"
            src={page.image}
          />
        ) : (
          <span className={styles.thumbnail_alt}>📄</span>
        )}
        <div className={styles.container}>
          <header>
            <h1 className={styles.title_text}>{page.title}</h1>
            <time className={styles.date_text}>
              {page.date.getFullYear()}-
              {String(page.date.getMonth() + 1).padStart(2, '0')}-
              {String(page.date.getDate()).padStart(2, '0')}
            </time>
          </header>
          {description && (
            <section>
              <p className={styles.description_text}>{description}</p>
            </section>
          )}
          <footer>
            <ul className={styles.link_list}>
              {page.links.map((title) => (
                <li key={title} className={styles.link}>
                  {title}
                </li>
              ))}
            </ul>
          </footer>
        </div>
      </Link>
    </article>
  )
}
