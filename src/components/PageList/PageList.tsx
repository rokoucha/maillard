import { PageMinimum } from '../../schema/scrapbox'
import { PageCard } from '../PageCard'
import styles from './PageList.module.css'

type Props = Readonly<{
  pages: PageMinimum[]
}>

export function PageList({ pages }: Props): React.ReactNode {
  return (
    <footer className={styles.wrapper}>
      <section className={styles.article_list}>
        {pages.map((page) => (
          <PageCard
            className={styles.article_item}
            key={page.id}
            page={{
              date: new Date(page.updated * 1000),
              image: page.image ?? null,
              links: page.links,
              title: page.title,
            }}
          />
        ))}
      </section>
    </footer>
  )
}
