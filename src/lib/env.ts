import * as v from 'valibot'

const SCRAPBOX_DEFAULT_BASE_URL = 'https://scrapbox.io/'

export const {
  BASE_URL,
  SCRAPBOX_BASE_URL,
  SCRAPBOX_COLLECT_PAGE,
  SCRAPBOX_CONNECT_SID,
  SCRAPBOX_INDEX_PAGE,
  SCRAPBOX_PROJECT,
  SCRAPBOX_PROXY_URL,
  SITE_LANG,
  SITE_NAME,
  NEXT_PHASE,
} = v.parse(
  v.object({
    BASE_URL: v.string(),
    NEXT_PHASE: v.optional(v.string()),
    SCRAPBOX_BASE_URL: v.optional(v.string(), SCRAPBOX_DEFAULT_BASE_URL),
    SCRAPBOX_COLLECT_PAGE: v.optional(v.string()),
    SCRAPBOX_CONNECT_SID: v.optional(v.string()),
    SCRAPBOX_INDEX_PAGE: v.string(),
    SCRAPBOX_PROJECT: v.string(),
    SCRAPBOX_PROXY_URL: v.optional(v.string()),
    SITE_LANG: v.optional(v.string()),
    SITE_NAME: v.string(),
  }),
  {
    BASE_URL: process.env.BASE_URL,
    NEXT_PHASE: process.env.NEXT_PHASE,
    SCRAPBOX_BASE_URL: process.env.SCRAPBOX_BASE_URL,
    SCRAPBOX_COLLECT_PAGE: process.env.SCRAPBOX_COLLECT_PAGE,
    SCRAPBOX_CONNECT_SID: process.env.SCRAPBOX_CONNECT_SID,
    SCRAPBOX_INDEX_PAGE: process.env.SCRAPBOX_INDEX_PAGE,
    SCRAPBOX_PROJECT: process.env.SCRAPBOX_PROJECT,
    SCRAPBOX_PROXY_URL: process.env.SCRAPBOX_PROXY_URL,
    SITE_LANG: process.env.SITE_LANG,
    SITE_NAME: process.env.SITE_NAME,
  },
)
