import { Page, processBlocks, processNodes, type Node } from '../domain/page'
import { SCRAPBOX_BASE_URL, SCRAPBOX_COLLECT_PAGE } from '../env'
import {
  present,
  presentRelatedPage,
  RelatedPageResponse,
  type PageResponse,
} from '../presentation/page'
import * as ImageRepository from '../repository/image'
import * as PageRepository from '../repository/page'
import * as PageInfoRepository from '../repository/pageinfo'

function normalizeTitleLc(title: string): string {
  return title.toLowerCase().replaceAll(' ', '_')
}

function isCollectPageTitle(title: string): boolean {
  return normalizeTitleLc(title) === normalizeTitleLc(SCRAPBOX_COLLECT_PAGE)
}

async function filterCollectPageLink(node: Node): Promise<Node | null> {
  ImageRepository

  switch (node.type) {
    case 'hashTag':
    case 'link': {
      if (isCollectPageTitle(node.href)) {
        return null
      }
    }

    default: {
      return node
    }
  }
}

async function resolveInternalImage(node: Node): Promise<Node | null> {
  switch (node.type) {
    case 'icon':
    case 'image':
    case 'strongIcon':
    case 'strongImage': {
      if (!node.src.startsWith(SCRAPBOX_BASE_URL)) {
        return node
      }

      const resolved = await ImageRepository.resolveInternalImageByUrl(node.src)
      if (!resolved) {
        return node
      }

      return {
        ...node,
        src: `/api/assets/${resolved}`,
      }
    }

    default: {
      return node
    }
  }
}

export async function findByTitle(title: string): Promise<PageResponse | null> {
  const page = await PageRepository.findByTitle(title)
  if (!page) {
    return null
  }

  const pageInfos = await PageInfoRepository.findMany()

  const titleLcMap = new Map(
    pageInfos.flatMap((p) => [
      [p.titleLc, p.title],
      [p.title.toLowerCase(), p.title],
    ]),
  )
  const pages = new Map(pageInfos.map((p) => [p.title, p]))
  const pagesLc = new Set(pageInfos.map((p) => p.titleLc))

  let image: string | null = null
  if (page.image) {
    if (page.image.startsWith(SCRAPBOX_BASE_URL)) {
      const resolved = await ImageRepository.resolveInternalImageByUrl(
        page.image,
      )
      if (resolved) {
        image = `/api/assets/${resolved}`
      }
    } else {
      image = page.image
    }
  }

  const links = page.links.filter((l) => {
    if (isCollectPageTitle(l)) {
      return false
    }

    return pages.has(l) || pagesLc.has(normalizeTitleLc(l))
  })

  const linksSet = new Set(links)

  const direct = await Promise.all(
    page.relatedPages.direct
      .filter((p) => {
        if (isCollectPageTitle(p.title)) {
          return false
        }

        return pages.has(p.title) || pagesLc.has(normalizeTitleLc(p.title))
      })
      .map(async (p) => {
        let image: string | null = null
        if (p.image) {
          if (p.image.startsWith(SCRAPBOX_BASE_URL)) {
            const resolved = await ImageRepository.resolveInternalImageByUrl(
              p.image,
            )
            if (resolved) {
              image = `/api/assets/${resolved}`
            }
          } else {
            image = p.image
          }
        }

        return {
          id: p.id,
          title: p.title,
          image,
          description: await processNodes(p.description, [
            filterCollectPageLink,
          ]),
          created: p.created,
          updated: p.updated,
          links: p.links
            .map((l) => titleLcMap.get(l) ?? l)
            .filter((l) => {
              if (isCollectPageTitle(l)) {
                return false
              }

              return pages.has(l) || pagesLc.has(normalizeTitleLc(l))
            }),
        }
      }),
  )

  const indirect = await Promise.all(
    page.relatedPages.indirect
      .filter((p) => {
        if (isCollectPageTitle(p.title)) {
          return false
        }

        if (!pages.has(p.title) && !pagesLc.has(normalizeTitleLc(p.title))) {
          return false
        }

        if (
          !p.links
            .map((l) => titleLcMap.get(l) ?? l)
            .some((l) => linksSet.has(l))
        ) {
          return false
        }

        return true
      })
      .map(async (p) => {
        let image: string | null = null
        if (p.image) {
          if (p.image.startsWith(SCRAPBOX_BASE_URL)) {
            const resolved = await ImageRepository.resolveInternalImageByUrl(
              p.image,
            )
            if (resolved) {
              image = `/api/assets/${resolved}`
            }
          } else {
            image = p.image
          }
        }

        return {
          id: p.id,
          title: p.title,
          image: image,
          description: await processNodes(p.description, [
            filterCollectPageLink,
          ]),
          created: p.created,
          updated: p.updated,
          links: p.links
            .map((l) => titleLcMap.get(l) ?? l)
            .filter((l) => {
              if (isCollectPageTitle(l)) {
                return false
              }

              return pages.has(l) || pagesLc.has(normalizeTitleLc(l))
            }),
        }
      }),
  )

  return present(
    {
      id: page.id,
      title: page.title,
      image: image,
      description: await processNodes(page.description, [
        filterCollectPageLink,
      ]),
      created: page.created,
      updated: page.updated,
      persistent: page.persistent,
      blocks: await processBlocks(page.blocks, [
        filterCollectPageLink,
        resolveInternalImage,
      ]),
      links,
      relatedPages: {
        direct,
        indirect,
      },
    },
    pages,
  )
}

export async function findAllTitles(): Promise<RelatedPageResponse[]> {
  const pageInfos = await PageInfoRepository.findMany()
  const pageInfosMap = new Map(pageInfos.map((p) => [p.title, p]))
  const pageInfosLcMap = new Map(pageInfos.map((p) => [p.titleLc, p]))
  const titleLcMap = new Map(
    pageInfos.flatMap((p) => [
      [p.titleLc, p.title],
      [p.title.toLowerCase(), p.title],
    ]),
  )

  const filteredPages = await Promise.all(
    pageInfos.map(async (p) => {
      let image: string | null = null
      if (p.image) {
        if (p.image.startsWith(SCRAPBOX_BASE_URL)) {
          const resolved = await ImageRepository.resolveInternalImageByUrl(
            p.image,
          )
          if (resolved) {
            image = `/api/assets/${resolved}`
          }
        } else {
          image = p.image
        }
      }

      return {
        id: p.id,
        title: p.title,
        image: image,
        description: await processNodes(p.description, [filterCollectPageLink]),
        created: p.created,
        updated: p.updated,
        links: p.links
          .map((l) => titleLcMap.get(l) ?? l)
          .filter((l) => {
            if (isCollectPageTitle(l)) {
              return false
            }

            return (
              pageInfosMap.has(l) || pageInfosLcMap.has(normalizeTitleLc(l))
            )
          }),
      }
    }),
  )

  return await Promise.all(
    filteredPages
      .sort((a, b) => b.created.getTime() - a.created.getTime())
      .map(async (p) => await presentRelatedPage(p)),
  )
}
