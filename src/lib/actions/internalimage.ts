import { cache } from 'react'
import {
  type InternalImage,
  type InternalImageSummary,
} from '../domain/internalimage'
import * as InternalImageUsecase from '../usecase/internalimage'

export const listInternalImages = cache(
  async (): Promise<InternalImageSummary[]> => {
    return await InternalImageUsecase.listInternalImages()
  },
)

export const findInternalImageByName = cache(
  async (name: string): Promise<InternalImage | null> => {
    return await InternalImageUsecase.findInternalImageByName(name)
  },
)
