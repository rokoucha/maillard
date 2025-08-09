import * as v from 'valibot'

export const {
  BASE_URL,
  SCRAPBOX_API_URL,
  SCRAPBOX_COLLECT_PAGE,
  SCRAPBOX_CONNECT_SID,
  SCRAPBOX_INDEX_PAGE,
  SCRAPBOX_PROJECT,
  SITE_LANG,
  SITE_NAME,
} = v.parse(
  v.object({
    BASE_URL: v.string(),
    SCRAPBOX_API_URL: v.optional(v.string(), 'https://scrapbox.io/api'),
    SCRAPBOX_COLLECT_PAGE: v.optional(v.string()),
    SCRAPBOX_CONNECT_SID: v.optional(v.string()),
    SCRAPBOX_INDEX_PAGE: v.string(),
    SCRAPBOX_PROJECT: v.string(),
    SITE_LANG: v.optional(v.string()),
    SITE_NAME: v.string(),
  }),
  {
    BASE_URL: process.env.BASE_URL,
    SCRAPBOX_API_URL: process.env.SCRAPBOX_API_URL,
    SCRAPBOX_COLLECT_PAGE: process.env.SCRAPBOX_COLLECT_PAGE,
    SCRAPBOX_CONNECT_SID: process.env.SCRAPBOX_CONNECT_SID,
    SCRAPBOX_INDEX_PAGE: process.env.SCRAPBOX_INDEX_PAGE,
    SCRAPBOX_PROJECT: process.env.SCRAPBOX_PROJECT,
    SITE_LANG: process.env.SITE_LANG,
    SITE_NAME: process.env.SITE_NAME,
  },
)
