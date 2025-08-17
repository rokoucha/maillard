export type InternalImageSummary = {
  name: string
  url: string
}

export type InternalImage = InternalImageSummary & {
  data: ArrayBuffer
}
