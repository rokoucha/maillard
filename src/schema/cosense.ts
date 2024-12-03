import { Block } from '@progfay/scrapbox-parser'
import * as v from 'valibot'

export const ErrorResponse = v.object({
  name: v.string(),
  message: v.string(),
  details: v.optional(
    v.union([
      v.object({
        linkTo: v.string(),
      }),
      v.object({
        project: v.string(),
        loginStrategies: v.array(v.string()),
      }),
    ]),
  ),
})
export type ErrorResponse = v.InferOutput<typeof ErrorResponse>

export const SearchTitlePage = v.object({
  id: v.string(),
  title: v.string(),
  links: v.array(v.string()),
  updated: v.number(),
  image: v.optional(v.nullable(v.string())),
})
export type SearchTitlePage = v.InferOutput<typeof SearchTitlePage>

export const SearchTitleResponse = v.union([
  ErrorResponse,
  v.array(SearchTitlePage),
])

const User = v.object({
  id: v.string(),
  name: v.string(),
  displayName: v.string(),
  photo: v.string(),
})

const LinksHop = v.object({
  id: v.string(),
  title: v.string(),
  titleLc: v.string(),
  image: v.nullable(v.string()),
  descriptions: v.array(v.string()),
  linksLc: v.array(v.string()),
  linked: v.number(),
  pageRank: v.number(),
  infoboxDisableLinks: v.array(v.any()),
  created: v.number(),
  updated: v.number(),
  accessed: v.number(),
  lastAccessed: v.optional(v.number()),
  infoboxResult: v.optional(v.array(v.any())),
})

const ProjectLinks1Hop = v.object({
  id: v.string(),
  title: v.string(),
  titleLc: v.string(),
  image: v.string(),
  descriptions: v.array(v.string()),
  linked: v.number(),
  created: v.nullable(v.number()),
  updated: v.number(),
  accessed: v.number(),
  projectName: v.string(),
})

export const GetPage = v.object({
  id: v.string(),
  title: v.string(),
  image: v.nullable(v.string()),
  descriptions: v.array(v.string()),
  user: User,
  lastUpdateUser: User,
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
  projectlinks: v.optional(v.array(v.string())),
  icons: v.array(v.string()),
  files: v.array(v.string()),
  infoboxDefinition: v.array(v.any()),
  infoboxResult: v.array(v.any()),
  infoboxDisableLinks: v.array(v.any()),
  relatedPages: v.object({
    links1hop: v.array(LinksHop),
    links2hop: v.array(LinksHop),
    projectLinks1hop: v.array(ProjectLinks1Hop),
    hasBackLinksOrIcons: v.boolean(),
    search: v.string(),
    searchBackend: v.string(),
  }),
  collaborators: v.array(User),
})
export type GetPage = v.InferOutput<typeof GetPage>

export const GetPageResponse = v.union([ErrorResponse, GetPage])

export type RelatedPage = {
  id: string
  title: string
  image: string | null
  description: string
  created: Date
  updated: Date
  links: string[]
}

export type ExternalLink = {
  id: string
  title: string
  image: string | null
  description: string
  updated: Date
}

export type Page = {
  id: string
  title: string
  image: string | null
  description: string
  pin: boolean
  created: Date
  updated: Date
  persistent: boolean
  blocks: Block[]
  links: string[]
  icons: string[]
  files: string[]
  relatedPages: RelatedPage[]
  externalLinks: ExternalLink[]
}

export type PageInfo = {
  id: string
  title: string
  links: string[]
  updated: Date
  image: string | null
}
