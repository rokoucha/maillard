import { Node } from '@progfay/scrapbox-parser'
import { SCRAPBOX_PROJECT } from '../../lib/env'
import { PageMinimum } from '../../schema/scrapbox'
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

function nodesToText(nodes: Node[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'blank':
          return ''
        case 'code':
          return node.text
        case 'commandLine':
          return node.text
        case 'decoration':
          return node.nodes.map((n) => nodesToText([n])).join('')
        case 'formula':
          return node.formula
        case 'googleMap':
          return node.place
        case 'hashTag':
          return node.href
        case 'helpfeel':
          return node.text
        case 'icon':
          return node.path
        case 'image':
          return node.link || node.src
        case 'link':
          return node.content || node.href
        case 'numberList':
          return node.nodes.map((n) => nodesToText([n])).join('')
        case 'plain':
          return node.text
        case 'quote':
          return node.nodes.map((n) => nodesToText([n])).join('')
        case 'strong':
          return node.nodes.map((n) => nodesToText([n])).join('')
        case 'strongIcon':
          return node.path
        case 'strongImage':
          return node.src

        default:
          throw new Error(
            `Unknown block type: ${(node satisfies never as any).type}`,
          )
      }
    })
    .join('')
}

type ContentNodeProps = Readonly<{
  node: Node
  pages: PageMinimum[]
  root?: boolean | undefined
}>

export function ContentNode({
  node,
  pages,
  root,
}: ContentNodeProps): React.ReactNode {
  const pagesMap = new Map(pages.map((p) => [p.title, p]))

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
        <Decoration
          decorations={node.decos}
          id={root ? nodesToText(node.nodes) : undefined}
        >
          {node.nodes.map((n, i) => (
            <ContentNode key={i} node={n} pages={pages} />
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
      const page = pagesMap.get(node.path)

      const href =
        node.pathType === 'relative'
          ? page
            ? `/${page.title}`
            : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.path}`
          : `https://scrapbox.io${node.path}`

      const src =
        node.pathType === 'relative'
          ? page?.image
            ? page.image
            : `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${node.path}/icon`
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
      let href = ''
      let type: 'internal' | 'external' | undefined = undefined
      switch (node.pathType) {
        case 'relative': {
          const page = pagesMap.get(node.href)
          if (page) {
            href = `/${page.title}`
          } else {
            href = `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.href}`
            type = 'internal'
          }
          break
        }

        case 'absolute': {
          href = node.href
          type = 'external'
          break
        }

        case 'root': {
          href = `https://scrapbox.io${node.href}`
          type = 'external'
          break
        }

        default: {
          throw new Error(
            `Unknown path type: ${(node satisfies never as any).pathType}`,
          )
        }
      }

      return (
        <Link href={href} type={type}>
          {node.content || node.href}
        </Link>
      )
    }

    case 'numberList': {
      return (
        <NumberList number={node.number}>
          {node.nodes.map((n, i) => (
            <ContentNode key={i} node={n} pages={pages} />
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
            <ContentNode key={i} node={n} pages={pages} />
          ))}
        </Quote>
      )
    }

    case 'strong': {
      return (
        <Decoration decorations={['*-1']}>
          {node.nodes.map((n, i) => (
            <ContentNode key={i} node={n} pages={pages} />
          ))}
        </Decoration>
      )
    }

    case 'strongIcon': {
      const page = pagesMap.get(node.path)

      const href =
        node.pathType === 'relative'
          ? page
            ? `/${page.title}`
            : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.path}`
          : `https://scrapbox.io${node.path}`

      const src =
        node.pathType === 'relative'
          ? page?.image
            ? page.image
            : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.path}/icon`
          : `https://scrapbox.io/api/pages${node.path}/icon`

      return <Icon href={href} path={node.path} src={src} strong={true} />
    }

    case 'strongImage': {
      return <Image alt={node.src} src={node.src} strong={true} />
    }

    default: {
      throw new Error(
        `Unknown block type: ${(node satisfies never as any).type}`,
      )
    }
  }
}
