type CodeBlockProps = Readonly<{
  content: string
  filename: string
}>

export function CodeBlock({
  content,
  filename,
}: CodeBlockProps): React.ReactNode {
  return (
    <div>
      <span>{filename}</span>
      <pre>
        <code>{content}</code>
      </pre>
    </div>
  )
}
