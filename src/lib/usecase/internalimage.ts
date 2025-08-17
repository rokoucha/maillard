import { InternalImage, InternalImageSummary } from '../domain/internalimage'
import { SCRAPBOX_COLLECT_PAGE, SCRAPBOX_INDEX_PAGE } from '../env'
import * as ImageRepository from '../repository/image'
import * as PageInfoRepository from '../repository/pageinfo'

export async function listInternalImages(): Promise<InternalImageSummary[]> {
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

  const images = new Set(
    await Promise.all(
      pageInfos.map(
        async (p) => await ImageRepository.listImagesInPageByTitle(p.title),
      ),
    ).then((i) => i.flat()),
  ).values()

  return await Promise.all(
    images.map(async (url) => {
      const name = await ImageRepository.resolveInternalImageByUrl(url)
      if (!name) {
        return null
      }

      return {
        name,
        url,
      }
    }),
  ).then((i) => i.filter((i): i is InternalImageSummary => i !== null))
}

export async function findInternalImageByName(
  name: string,
): Promise<InternalImage | null> {
  const images = await listInternalImages()
  const image = images.find((i) => i.name === name)
  if (!image) {
    return null
  }

  const data = await ImageRepository.fetchInternalImageByUrl(image.url)
  if (!data) {
    return null
  }

  return {
    ...image,
    data,
  }
}
