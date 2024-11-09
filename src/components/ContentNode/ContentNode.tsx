import { Node } from '@progfay/scrapbox-parser'
import { SCRAPBOX_PROJECT } from '../../lib/env'
import { Code } from './Node/Code'
import { CommandLine } from './Node/CommandLine'
import { Decoration } from './Node/Decoration'

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
      return <code>{node.formula}</code>
    }

    case 'googleMap': {
      return (
        <a href={node.url}>
          {node.place || `${node.latitude} ${node.longitude}`}
        </a>
      )
    }

    case 'hashTag': {
      return <a href={node.href}>#{node.href}</a>
    }

    case 'helpfeel': {
      return <code>{node.text}</code>
    }

    case 'icon': {
      return (
        <img
          src={`https://scrapbox.io/api/pages/${node.pathType === 'relative' ? `${SCRAPBOX_PROJECT}/` : ''}${node.path}/icon`}
        />
      )
    }

    case 'image': {
      return (
        <a href={node.link}>
          <img src={node.src} />
        </a>
      )
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
        <a href={href} {...(external ? { target: '_blank' } : {})}>
          {node.content || node.href}
          {external && ' ↗'}
        </a>
      )
    }

    case 'numberList': {
      return (
        <>
          {node.number}{' '}
          {node.nodes.map((n, i) => (
            <ContentNode key={i} node={n} />
          ))}
        </>
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
