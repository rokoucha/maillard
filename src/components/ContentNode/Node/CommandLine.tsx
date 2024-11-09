import clsx from 'clsx'
import styles from './CommandLine.module.css'

type Props = Readonly<{
  children: string
  symbol: string
}>

export function CommandLine({ children, symbol }: Props): React.ReactNode {
  return (
    <code
      className={clsx(
        styles.commandline,
        symbol === '$' ? styles.prompt_user : styles.prompt_root,
      )}
    >
      {children}
    </code>
  )
}
