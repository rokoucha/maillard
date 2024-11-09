import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import styles from './CodeBlock.module.css'

type CodeBlockProps = Readonly<{
  content: string
  extension?: string | undefined
  filename: string
  href: string
}>

export function CodeBlock({
  content,
  extension,
  filename,
  href,
}: CodeBlockProps): React.ReactNode {
  const code = hljs.highlightAuto(content, extension ? [extension] : [])

  return (
    <div>
      <code className={styles.filename}>
        <a className={styles.link} href={href} target="_blank">
          {filename}
        </a>
      </code>
      <pre className={styles.pre}>
        {code.language && (
          <span className={styles.language}>{code.language}</span>
        )}
        <code dangerouslySetInnerHTML={{ __html: code.value }} />
      </pre>
    </div>
  )
}
