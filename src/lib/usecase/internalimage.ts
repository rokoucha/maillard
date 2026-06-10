import { InternalImage, InternalImageSummary } from '../domain/internalimage'
import * as ImageRepository from '../repository/image'
import * as PageInfoRepository from '../repository/pageinfo'

export async function listInternalImages(): Promise<InternalImageSummary[]> {
  const pageInfos = await PageInfoRepository.findMany()

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
