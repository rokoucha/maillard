import * as v from 'valibot'

export const {
  BASE_URL,
  SCRAPBOX_COLLECT_PAGE,
  SCRAPBOX_CONNECT_SID,
  SCRAPBOX_INDEX_PAGE,
  SCRAPBOX_PROJECT,
  SITE_NAME,
} = v.parse(
  v.object({
    BASE_URL: v.string(),
    SCRAPBOX_COLLECT_PAGE: v.optional(v.string()),
    SCRAPBOX_CONNECT_SID: v.optional(v.string()),
    SCRAPBOX_INDEX_PAGE: v.string(),
    SCRAPBOX_PROJECT: v.string(),
    SITE_NAME: v.string(),
  }),
  process.env,
)
