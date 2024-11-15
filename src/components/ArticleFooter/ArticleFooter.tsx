import clsx from 'clsx'
import { RelatedPage } from '../../schema/scrapbox'
import { PageCard } from '../PageCard'
import styles from './ArticleFooter.module.css'

type Props = Readonly<{
  persistent?: boolean | undefined
  relatedPages: RelatedPage[]
}>

export function ArticleFooter({
  relatedPages,
  persistent,
}: Props): React.ReactNode {
  return (
    <footer
      className={clsx({
        [styles.wrapper]: true,
        [styles.hr]: persistent ?? true,
      })}
    >
      {persistent && (
        <header>
          <h2 className={styles.title_text}>Related article</h2>
        </header>
      )}
      {relatedPages.length > 0 ? (
        <section className={styles.article_list}>
          {relatedPages.map((page) => (
            <PageCard
              className={styles.article_item}
              key={page.id}
              page={{
                date: new Date(page.updated * 1000),
                descriptions: page.descriptions,
                image: page.image,
                links: page.linksLc,
                title: page.title,
              }}
            />
          ))}
        </section>
      ) : (
        <section>
          <p>There is no related pages.</p>
        </section>
      )}
    </footer>
  )
}
