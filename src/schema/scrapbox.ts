import * as v from 'valibot'

export const ErrorResponse = v.object({
  name: v.string(),
  message: v.string(),
  details: v.object({
    linkTo: v.string(),
  }),
})
export type ErrorResponse = v.InferOutput<typeof ErrorResponse>

export const RelatedPage = v.object({
  id: v.string(),
  title: v.string(),
  image: v.nullable(v.string()),
  descriptions: v.array(v.string()),
  linksLc: v.array(v.string()),
  created: v.number(),
  updated: v.number(),
  accessed: v.number(),
})
export type RelatedPage = v.InferOutput<typeof RelatedPage>

export const Page = v.object({
  id: v.string(),
  title: v.string(),
  image: v.nullable(v.string()),
  descriptions: v.array(v.string()),
  created: v.number(),
  updated: v.number(),
  accessed: v.number(),
  linesCount: v.optional(v.number()),
  charsCount: v.optional(v.number()),
  persistent: v.boolean(),
  lines: v.array(
    v.object({
      id: v.string(),
      text: v.string(),
      userId: v.string(),
      created: v.number(),
      updated: v.number(),
    }),
  ),
  files: v.array(v.string()),
  relatedPages: v.object({
    links1hop: v.array(RelatedPage),
  }),
})
export type Page = v.InferOutput<typeof Page>

export const GetPageResponse = v.union([ErrorResponse, Page])
export type GetPageResponse = v.InferOutput<typeof GetPageResponse>

export const PageMinimum = v.object({
  id: v.string(),
  title: v.string(),
  links: v.array(v.string()),
  image: v.optional(v.nullable(v.string())),
  updated: v.number(),
})
export type PageMinimum = v.InferOutput<typeof PageMinimum>

export const SearchTitleResponse = v.array(PageMinimum)
export type SearchTitleResponse = v.InferOutput<typeof SearchTitleResponse>
