import { PageInfo } from '../domain/pageinfo'

export type PageInfoResponse = {
  id: string
  title: string
  links: string[]
  updated: Date
  image: string | null
}

export async function present(pageInfo: PageInfo): Promise<PageInfoResponse> {
  return {
    id: pageInfo.id,
    title: pageInfo.title,
    links: pageInfo.links,
    updated: pageInfo.updated,
    image: pageInfo.image,
  }
}
