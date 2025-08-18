import * as cosense from '../cosense'
import { type PageInfo } from '../domain/pageinfo'

export async function findMany(): Promise<PageInfo[]> {
  const pages = await cosense.searchTitles()
  const infos = pages.map((p) => ({
    id: p.id,
    title: p.title,
    links: p.links,
    updated: new Date(p.updated * 1000),
    image: p.image?.startsWith('https://i.gyazo.com')
      ? p.image.replace(/\/raw$/, '')
      : (p.image ?? null),
  }))

  return infos.sort((a, b) => b.updated.getTime() - a.updated.getTime())
}
