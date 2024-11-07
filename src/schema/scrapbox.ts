import * as v from 'valibot'

export const ErrorResponse = v.object({
  name: v.string(),
  message: v.string(),
  details: v.object({
    linkTo: v.string(),
  }),
})
export type ErrorResponse = v.InferOutput<typeof ErrorResponse>

export const Page = v.object({
  id: v.string(),
  title: v.string(),
  image: v.nullable(v.string()),
  descriptions: v.array(v.string()),
  user: v.object({
    id: v.string(),
    name: v.string(),
    displayName: v.string(),
    photo: v.string(),
  }),
  lastUpdateUser: v.nullable(
    v.object({
      id: v.string(),
      name: v.string(),
      displayName: v.string(),
      photo: v.string(),
    }),
  ),
  pin: v.number(),
  views: v.number(),
  linked: v.number(),
  commitId: v.optional(v.string()),
  created: v.number(),
  updated: v.number(),
  accessed: v.number(),
  snapshotCreated: v.nullable(v.number()),
  snapshotCount: v.optional(v.number()),
  pageRank: v.number(),
  lastAccessed: v.nullable(v.number()),
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
  links: v.array(v.string()),
  projectLinks: v.array(v.string()),
  icons: v.array(v.string()),
  files: v.array(v.string()),
  infoboxDefinition: v.array(v.any()),
  infoboxResult: v.array(v.any()),
  infoboxDisableLinks: v.array(v.any()),
  relatedPages: v.object({
    links1hop: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        titleLc: v.string(),
        image: v.nullable(v.string()),
        descriptions: v.array(v.string()),
        linksLc: v.array(v.string()),
        linked: v.number(),
        pageRank: v.number(),
        created: v.number(),
        updated: v.number(),
        accessed: v.number(),
        lastAccessed: v.nullable(v.number()),
      }),
    ),
    links2hop: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        titleLc: v.string(),
        image: v.nullable(v.string()),
        descriptions: v.array(v.string()),
        linksLc: v.array(v.string()),
        linked: v.number(),
        pageRank: v.number(),
        infoboxResult: v.optional(v.array(v.any())),
        infoboxDisableLinks: v.optional(v.array(v.any())),
        created: v.number(),
        updated: v.number(),
        accessed: v.number(),
        lastAccessed: v.nullable(v.number()),
      }),
    ),
    projectLinks1hop: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        titleLc: v.string(),
        image: v.nullable(v.string()),
        descriptions: v.array(v.string()),
        linksLc: v.array(v.string()),
        linked: v.number(),
        created: v.nullable(v.number()),
        updated: v.number(),
        accessed: v.number(),
        projectName: v.string(),
      }),
    ),
    hasBackLinksOrIcons: v.boolean(),
    search: v.string(),
    searchBackend: v.string(),
  }),
  collaborators: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      displayName: v.string(),
      photo: v.string(),
    }),
  ),
})
export type Page = v.InferOutput<typeof Page>

export const GetPageResponse = v.union([ErrorResponse, Page])
export type GetPageResponse = v.InferOutput<typeof GetPageResponse>

export const PageDetail = v.object({
  id: v.string(),
  title: v.string(),
  image: v.nullable(v.string()),
  descriptions: v.array(v.string()),
  user: v.object({
    id: v.string(),
  }),
  lastUpdateUser: v.nullable(
    v.object({
      id: v.string(),
    }),
  ),
  pin: v.number(),
  views: v.number(),
  linked: v.number(),
  commitId: v.string(),
  created: v.number(),
  updated: v.number(),
  accessed: v.number(),
  lastAccessed: v.optional(v.number()),
  snapshotCreated: v.number(),
  pageRank: v.number(),
  linesCount: v.number(),
  charsCount: v.number(),
})
export type PageDetail = v.InferOutput<typeof PageDetail>

export const Pages = v.object({
  projectName: v.string(),
  skip: v.number(),
  limit: v.number(),
  count: v.number(),
  pages: v.array(PageDetail),
})
export type Pages = v.InferOutput<typeof Pages>

export const PageMinimum = v.object({
  id: v.string(),
  title: v.string(),
  links: v.array(v.string()),
  image: v.optional(v.nullable(v.string())),
  updated: v.number(),
})
export type PageMinimum = v.InferOutput<typeof PageMinimum>

export const SearchTitle = v.array(PageMinimum)
export type SearchTitle = v.InferOutput<typeof SearchTitle>
