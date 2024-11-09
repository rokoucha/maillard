import { Node } from '@progfay/scrapbox-parser'
import { SCRAPBOX_PROJECT } from '../../lib/env'
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

type ContentNodeProps = Readonly<{
  node: Node
}>

export function ContentNode({ node }: ContentNodeProps): React.ReactNode {
  switch (node.type) {
    case 'blank': {
      return null
    }

    case 'code': {
      return <Code>{node.text}</Code>
    }

    case 'commandLine': {
      return <CommandLine symbol={node.symbol}>{node.text}</CommandLine>
    }

    case 'decoration': {
      return (
        <Decoration decorations={node.decos}>
          {node.nodes.map((n, i) => (
            <ContentNode key={i} node={n} />
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
      const absolutePath =
        node.pathType === 'relative'
          ? `/${SCRAPBOX_PROJECT}/${node.path}`
          : node.path

      return (
        <Icon
          href={`https://scrapbox.io${absolutePath}`}
          path={node.path}
          src={`https://scrapbox.io/api/pages${absolutePath}/icon`}
        />
      )
    }

    case 'image': {
      return <Image link={node.link} src={node.src} />
    }

    case 'link': {
      let href = ''
      let external = false
      switch (node.pathType) {
        case 'relative': {
          href = `/${node.href}`
          break
        }

        case 'absolute': {
          href = node.href
          external = true
          break
        }

        case 'root': {
          href = `https://scrapbox.io${node.href}`
          external = true
          break
        }

        default: {
          throw new Error(
            `Unknown path type: ${(node satisfies never as any).pathType}`,
          )
        }
      }

      return (
        <Link external={external} href={href}>
          {node.content || node.href}
        </Link>
      )
    }

    case 'numberList': {
      return (
        <NumberList number={node.number}>
          {node.nodes.map((n, i) => (
            <ContentNode key={i} node={n} />
          ))}
        </NumberList>
      )
    }

    case 'plain': {
      return node.text
    }

    case 'quote': {
      return (
        <blockquote>
          {node.nodes.map((n, i) => (
            <ContentNode key={i} node={n} />
          ))}
        </blockquote>
      )
    }

    case 'strong': {
      return (
        <Decoration decorations={['*-1']}>
          {node.nodes.map((n, i) => (
            <ContentNode key={i} node={n} />
          ))}
        </Decoration>
      )
    }

    case 'strongIcon': {
      return (
        <img
          src={`https://scrapbox.io/api/pages/${node.pathType === 'relative' ? `${SCRAPBOX_PROJECT}/` : ''}${node.path}/icon`}
        />
      )
    }

    case 'strongImage': {
      return <img src={node.src} />
    }

    default: {
      throw new Error(
        `Unknown block type: ${(node satisfies never as any).type}`,
      )
    }
  }
}
