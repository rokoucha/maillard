import temml from 'temml'

type Props = Readonly<{
  children: string
}>

export function Formula({ children }: Props): React.ReactNode {
  const mathML = temml.renderToString(children)

  return <div dangerouslySetInnerHTML={{ __html: mathML }} />
}
