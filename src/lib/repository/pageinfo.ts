import * as cosense from '../cosense'
import { SCRAPBOX_COLLECT_PAGE, SCRAPBOX_INDEX_PAGE } from '../env'
import { parseDescription } from '../domain/page'
import { type PageInfo } from '../domain/pageinfo'

function normalizeImage(image: string | null | undefined): string | null {
  if (!image) return null
  return image.startsWith('https://i.gyazo.com')
    ? image.replace(/\/raw$/, '')
    : image
}

function normalizeTitleLc(title: string): string {
  return title.toLowerCase().replaceAll(' ', '_')
}

export async function findMany(): Promise<PageInfo[]> {
  const pages = await cosense.links1hop(SCRAPBOX_COLLECT_PAGE)
  const infos = await Promise.all(
    pages.map(async (p) => ({
      id: p.id,
      title: p.title,
      titleLc: p.titleLc,
      links: p.linksLc,
      description: await parseDescription(p.descriptions),
      created: new Date(p.created * 1000),
      updated: new Date(p.updated * 1000),
      image: normalizeImage(p.image),
    })),
  )

  if (!infos.some((p) => p.titleLc === normalizeTitleLc(SCRAPBOX_INDEX_PAGE))) {
    const indexPage = await cosense.page(SCRAPBOX_INDEX_PAGE)
    if (indexPage) {
      infos.push({
        id: indexPage.id,
        title: indexPage.title,
        titleLc: normalizeTitleLc(indexPage.title),
        links: indexPage.links.map((l) => normalizeTitleLc(l)),
        description: await parseDescription(indexPage.descriptions),
        created: new Date(indexPage.created * 1000),
        updated: new Date(indexPage.updated * 1000),
        image: normalizeImage(indexPage.image),
      })
    }
  }

  const filtered = infos.filter((p) => {
    if (
      normalizeTitleLc(SCRAPBOX_COLLECT_PAGE) ===
      normalizeTitleLc(SCRAPBOX_INDEX_PAGE)
    ) {
      return true
    }

    return p.titleLc !== normalizeTitleLc(SCRAPBOX_COLLECT_PAGE)
  })

  return filtered.sort((a, b) => b.updated.getTime() - a.updated.getTime())
}
