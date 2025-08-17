import { type Block, type Node } from './block'

export type Page = {
  id: string
  title: string
  image: string | null
  description: Node[]
  created: Date
  updated: Date
  persistent: boolean
  blocks: Block[]
  links: string[]
  relatedPages: {
    direct: RelatedPage[]
    indirect: RelatedPage[]
  }
}

export type RelatedPage = {
  id: string
  title: string
  image: string | null
  description: Node[]
  created: Date
  updated: Date
  links: string[]
}
