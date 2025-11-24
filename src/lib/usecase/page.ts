import { Page, processBlocks, processNodes, type Node } from '../domain/page'
import {
  SCRAPBOX_BASE_URL,
  SCRAPBOX_COLLECT_PAGE,
  SCRAPBOX_INDEX_PAGE,
} from '../env'
import {
  present,
  presentRelatedPage,
  RelatedPageResponse,
  type PageResponse,
} from '../presentation/page'
import * as ImageRepository from '../repository/image'
import * as PageRepository from '../repository/page'
import * as PageInfoRepository from '../repository/pageinfo'

async function filterCollectPageLink(node: Node): Promise<Node | null> {
  // 全ページ公開なら何もフィルタしない
  if (!SCRAPBOX_COLLECT_PAGE) {
    return node as Node
  }

  ImageRepository

  switch (node.type) {
    // 一部ページ公開なら収集ページへのリンクをフィルタする
    case 'hashTag':
    case 'link': {
      if (node.href === SCRAPBOX_COLLECT_PAGE) {
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

  const pageInfos = await PageInfoRepository.findMany().then((i) =>
    i.filter((p) => {
      // 全ページ公開なら何もフィルタしない
      if (!SCRAPBOX_COLLECT_PAGE) {
        return true
      }

      // 一部公開のフィルタリング

      // インデックスページは無条件で公開(たとえ収集ページと同一だとしても)
      if (p.title === SCRAPBOX_INDEX_PAGE) {
        return true
      }

      // 収集ページは基本非公開、インデックスページと同一なら公開される
      if (p.title === SCRAPBOX_COLLECT_PAGE) {
        return false
      }

      // 一般ページは収集ページがリンクに含まれているなら公開
      return p.links.includes(SCRAPBOX_COLLECT_PAGE)
    }),
  )
  const pages = new Map(pageInfos.map((p) => [p.title, p]))

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
    // 全ページ公開なら何もフィルタしない
    if (!SCRAPBOX_COLLECT_PAGE) {
      return true
    }

    // 収集ページは非公開
    if (l === SCRAPBOX_COLLECT_PAGE) {
      return false
    }

    // 一般ページは公開対象なら公開
    return pages.has(l)
  })

  const direct = await Promise.all(
    page.relatedPages.direct
      .filter((p) => {
        // 全ページ公開なら何もフィルタしない
        if (!SCRAPBOX_COLLECT_PAGE) {
          return true
        }

        // 一部公開のフィルタリング

        // 収集ページは非公開
        if (p.title === SCRAPBOX_COLLECT_PAGE) {
          return false
        }

        // 一般ページは公開対象なら公開
        return pages.has(p.title)
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
          links: p.links.filter((l) => {
            // 全ページ公開なら何もフィルタしない
            if (!SCRAPBOX_COLLECT_PAGE) {
              return true
            }

            // 一部公開のフィルタリング

            // 収集ページは非公開
            if (l === SCRAPBOX_COLLECT_PAGE) {
              return false
            }

            // 一般ページは公開対象なら公開
            return pages.has(l)
          }),
        }
      }),
  )

  const indirect = await Promise.all(
    page.relatedPages.indirect
      .filter((p) => {
        // 全ページ公開なら何もフィルタしない
        if (!SCRAPBOX_COLLECT_PAGE) {
          return true
        }

        // 一部公開のフィルタリング

        // 収集ページは非公開
        if (p.title === SCRAPBOX_COLLECT_PAGE) {
          return false
        }

        // 一般ページ
        // 公開対象じゃないなら非公開
        if (!pages.has(p.title)) {
          return false
        }

        // 収集ページ以外でリンクされていないならリンクされてない扱いにする
        if (
          !p.links.some((l) =>
            page.links.filter((l) => l !== SCRAPBOX_COLLECT_PAGE).includes(l),
          )
        ) {
          return false
        }

        // それ以外は公開
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
          links: p.links.filter((l) => {
            // 全ページ公開なら何もフィルタしない
            if (!SCRAPBOX_COLLECT_PAGE) {
              return true
            }

            // 収集ページは非公開
            if (l === SCRAPBOX_COLLECT_PAGE) {
              return false
            }

            // 一般ページは公開対象なら公開
            return pages.has(l)
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
  const pageInfos = await PageInfoRepository.findMany().then((i) =>
    i.filter((p) => {
      // 全ページ公開なら何もフィルタしない
      if (!SCRAPBOX_COLLECT_PAGE) {
        return true
      }

      // 一部公開のフィルタリング

      // インデックスページは無条件で公開(たとえ収集ページと同一だとしても)
      if (p.title === SCRAPBOX_INDEX_PAGE) {
        return true
      }

      // 収集ページは基本非公開、インデックスページと同一なら公開される
      if (p.title === SCRAPBOX_COLLECT_PAGE) {
        return false
      }

      // 一般ページは収集ページがリンクに含まれているなら公開
      return p.links.includes(SCRAPBOX_COLLECT_PAGE)
    }),
  )
  const pageInfosMap = new Map(pageInfos.map((p) => [p.title, p]))

  const pages = await Promise.all(
    pageInfos.map(async (p) => await PageRepository.findByTitle(p.title)),
  )

  const filteredPages = await Promise.all(
    pages
      .filter((p): p is Page => p !== null)
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
          links: p.links.filter((l) => {
            // 全ページ公開なら何もフィルタしない
            if (!SCRAPBOX_COLLECT_PAGE) {
              return true
            }

            // 収集ページは非公開
            if (l === SCRAPBOX_COLLECT_PAGE) {
              return false
            }

            // 一般ページは公開対象なら公開
            return pageInfosMap.has(l)
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
