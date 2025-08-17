import { SCRAPBOX_COLLECT_PAGE, SCRAPBOX_INDEX_PAGE } from '../env'
import { PageInfoResponse, present } from '../presentation/pageinfo'
import * as PageInfoRepository from '../repository/pageinfo'

export async function findMany(): Promise<PageInfoResponse[]> {
  const pageInfos = await PageInfoRepository.findMany()

  return await Promise.all(
    pageInfos
      .filter((p) => {
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
      })
      .map(async (p) => await present(p)),
  )
}
