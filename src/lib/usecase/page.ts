import { Node, processBlocks } from '../domain/block'
import { SCRAPBOX_COLLECT_PAGE, SCRAPBOX_INDEX_PAGE } from '../env'
import { PageResponse, present } from '../presentation/page'
import * as PageRepository from '../repository/page'
import * as PageInfoRepository from '../repository/pageinfo'

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

  const filterCollectPageLink = async (node: Node): Promise<Node | null> => {
    // 全ページ公開なら何もフィルタしない
    if (!SCRAPBOX_COLLECT_PAGE) {
      return node
    }

    switch (node.type) {
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

  const blocks = await processBlocks(page.blocks, [
    {
      types: ['hashTag', 'link'],
      processor: filterCollectPageLink,
    },
  ])

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

  const direct = page.relatedPages.direct
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
    .map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image,
      description: p.description,
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
    }))

  const indirect = page.relatedPages.indirect
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

      // 一次リンクに含まれていないなら非公開
      if (!p.links.some((l) => direct.some((d) => d.title === l))) {
        return false
      }

      // それ以外は公開
      return true
    })
    .map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image,
      description: p.description,
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
    }))

  return present({
    id: page.id,
    title: page.title,
    image: page.image,
    description: page.description,
    created: page.created,
    updated: page.updated,
    persistent: page.persistent,
    blocks,
    links,
    relatedPages: {
      direct,
      indirect,
    },
  })
}

export async function findMany(): Promise<PageResponse[]> {
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

  const pages = await Promise.all(
    pageInfos.map(async (p) => await findByTitle(p.title)),
  )

  return pages
    .filter((p): p is PageResponse => p !== null)
    .sort((a, b) => b.created.getTime() - a.created.getTime())
}
