import { ComponentPropsWithoutRef } from 'react'
import { PageCard } from '../PageCard'
import styles from './PageList.module.css'

type Props = Readonly<{
  pages: ComponentPropsWithoutRef<typeof PageCard>['page'][]
}>

export function PageList({ pages }: Props): React.ReactNode {
  return (
    <section className={styles.article_list}>
      {pages.map((page) => (
        <PageCard className={styles.article_item} key={page.id} page={page} />
      ))}
    </section>
  )
}
