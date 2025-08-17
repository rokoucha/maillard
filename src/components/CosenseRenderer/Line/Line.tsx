import { SCRAPBOX_PROJECT } from '../../../lib/env'
import { nodesToText } from '../../../lib/parser'
import { type Node } from '../../../lib/presentation/page'
import { PageInfo } from '../../../schema/cosense'
import { Code } from './Node/Code'
import { CommandLine } from './Node/CommandLine'
import { Decoration } from './Node/Decoration'
import { Formula } from './Node/Formula'
import { GoogleMap } from './Node/GoogleMap'
import { HashTag } from './Node/HashTag'
import { Helpfeel } from './Node/Helpfeel'
import { Icon } from './Node/Icon'
import { Image } from './Node/Image'
import { Link } from './Node/Link'
import { NumberList } from './Node/NumberList'
import { Quote } from './Node/Quote'

type Props = Readonly<{
  node: Node
  pageInfos: Map<string, PageInfo>
  root?: boolean | undefined
}>

export function Line({ node, pageInfos, root }: Props): React.ReactNode {
  switch (node.type) {
    case 'blank': {
      return false
    }

    case 'code': {
      return <Code>{node.text}</Code>
    }

    case 'commandLine': {
      return <CommandLine symbol={node.symbol}>{node.text}</CommandLine>
    }

    case 'decoration': {
      return (
        <Decoration
          decorations={node.decos}
          id={root ? nodesToText(node.nodes as any) : undefined}
        >
          {node.nodes.map((n, i) => (
            <Line key={i} node={n} pageInfos={pageInfos} />
          ))}
        </Decoration>
      )
    }

    case 'formula': {
      return <Formula>{node.formula}</Formula>
    }

    case 'googleMap': {
      return (
        <GoogleMap
          latitude={node.latitude}
          longitude={node.longitude}
          place={node.place}
          url={node.url}
          zoom={node.zoom}
        />
      )
    }

    case 'hashTag': {
      return <HashTag>{node.href}</HashTag>
    }

    case 'helpfeel': {
      return <Helpfeel>{node.text}</Helpfeel>
    }

    case 'icon': {
      const page = pageInfos.get(node.path)

      const href =
        node.pathType === 'relative'
          ? page
            ? `/${page.title}`
            : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.path}`
          : `https://scrapbox.io${node.path}`

      const src =
        node.pathType === 'relative'
          ? ((page?.image?.startsWith('https://i.gyazo.com')
              ? page?.image.replace(/\/raw$/, '')
              : page?.image) ??
            `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${node.path}/icon`)
          : `https://scrapbox.io/api/pages${node.path}/icon`

      return <Icon href={href} path={node.path} src={src} />
    }

    case 'image': {
      return (
        <Image
          alt={node.link || node.src}
          link={node.link || node.src}
          src={node.src}
        />
      )
    }

    case 'link': {
      return (
        <Link href={node.href} type={node.pathType}>
          {node.content || node.href}
        </Link>
      )
    }

    case 'numberList': {
      return (
        <NumberList number={node.number}>
          {node.nodes.map((n, i) => (
            <Line key={i} node={n} pageInfos={pageInfos} />
          ))}
        </NumberList>
      )
    }

    case 'plain': {
      return node.text
    }

    case 'quote': {
      return (
        <Quote>
          {node.nodes.map((n, i) => (
            <Line key={i} node={n} pageInfos={pageInfos} />
          ))}
        </Quote>
      )
    }

    case 'strong': {
      return (
        <Decoration decorations={['*-1']}>
          {node.nodes.map((n, i) => (
            <Line key={i} node={n} pageInfos={pageInfos} />
          ))}
        </Decoration>
      )
    }

    case 'strongIcon': {
      const page = pageInfos.get(node.path)

      const href =
        node.pathType === 'relative'
          ? page
            ? `/${page.title}`
            : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.path}`
          : `https://scrapbox.io${node.path}`

      const src =
        node.pathType === 'relative'
          ? ((page?.image?.startsWith('https://i.gyazo.com')
              ? page?.image.replace(/\/raw$/, '')
              : page?.image) ??
            `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${node.path}/icon`)
          : `https://scrapbox.io/api/pages${node.path}/icon`

      return <Icon href={href} path={node.path} src={src} strong={true} />
    }

    case 'strongImage': {
      return <Image alt={node.src} src={node.src} strong={true} />
    }

    default: {
      throw new Error(
        `Unknown node type: ${(node satisfies never as any).type}`,
      )
    }
  }
}
