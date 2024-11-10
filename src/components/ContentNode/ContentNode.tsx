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
import { StrongImage } from './Node/StrongImage'

type ContentNodeProps = Readonly<{
  node: Node
  pages: PageMinimum[]
}>

export function ContentNode({
  node,
  pages,
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
        <Decoration decorations={node.decos}>
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
            : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.path}/icon`
          : `https://scrapbox.io/api/pages${node.path}/icon`

      return <Icon href={href} path={node.path} src={src} />
    }

    case 'image': {
      return <Image link={node.link || node.src} src={node.src} />
    }

    case 'link': {
      let href = ''
      let external = false
      switch (node.pathType) {
        case 'relative': {
          const page = pagesMap.get(node.href)
          href = page
            ? `/${page.title}`
            : `https://scrapbox.io/${SCRAPBOX_PROJECT}/${node.href}`
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
      return <StrongImage src={node.src} />
    }

    default: {
      throw new Error(
        `Unknown block type: ${(node satisfies never as any).type}`,
      )
    }
  }
}
