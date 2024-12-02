import clsx from 'clsx'
import styles from './ArticleFooter.module.css'

type Props = Readonly<{
  children?: React.ReactNode | undefined
  hr?: boolean | undefined
}>

export function ArticleFooter({ children, hr }: Props): React.ReactNode {
  return (
    <footer
      className={clsx(styles.wrapper, {
        [styles.hr]: hr ?? true,
      })}
    >
      {children}
    </footer>
  )
}
