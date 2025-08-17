import { cache } from 'react'
import { PageResponse } from '../presentation/page'
import * as PageUsecase from '../usecase/page'

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
