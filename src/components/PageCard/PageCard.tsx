import clsx from 'clsx'
import Link from 'next/link'
import { type RelatedPage } from '../../lib/presentation/page'
import styles from './PageCard.module.css'

export type Props = Readonly<{
  className?: string | undefined
  page: RelatedPage
}>

export function PageCard({ className, page }: Props): React.ReactNode {
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
              {page.created.getFullYear()}-
              {String(page.created.getMonth() + 1).padStart(2, '0')}-
              {String(page.created.getDate()).padStart(2, '0')}
            </time>
          </header>
          <section>
            <p className={styles.description_text}>{page.description}</p>
          </section>
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
