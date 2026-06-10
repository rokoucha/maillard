import { type Node } from './page'

export type PageInfo = {
  id: string
  title: string
  titleLc: string
  links: string[]
  description: Node[]
  created: Date
  updated: Date
  image: string | null
}
