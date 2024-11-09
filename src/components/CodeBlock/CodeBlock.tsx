import styles from './CodeBlock.module.css'

type CodeBlockProps = Readonly<{
  content: string
  filename: string
  href: string
}>

export function CodeBlock({
  content,
  filename,
  href,
}: CodeBlockProps): React.ReactNode {
  return (
    <div>
      <code className={styles.filename}>
        <a className={styles.link} href={href} target="_blank">
          {filename}
        </a>
      </code>
      <pre className={styles.pre}>
        <code>{content}</code>
      </pre>
    </div>
  )
}
