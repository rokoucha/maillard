import { cache } from 'react'
import { PageResponse } from '../presentation/page'
import { type PageInfoResponse } from '../presentation/pageinfo'
import * as PageUsecase from '../usecase/page'
import * as PageInfoUsecase from '../usecase/pageinfo'

const getPageList = cache(async function getPageList(): Promise<
  PageInfoResponse[]
> {
  return await PageInfoUsecase.findMany()
})

export const getPage = cache(async function getPage(
  title: string,
): Promise<PageResponse | null> {
  return await PageUsecase.findByTitle(title)
})

export const getPages = cache(async function getPages(): Promise<
  PageResponse[]
> {
  return await PageUsecase.findMany()
})
