import * as v from 'valibot'

export const {
  SCRAPBOX_COLLECT_PAGE,
  SCRAPBOX_CONNECT_SID,
  SCRAPBOX_INDEX_PAGE,
  SCRAPBOX_PROJECT,
} = v.parse(
  v.object({
    SCRAPBOX_COLLECT_PAGE: v.optional(v.string()),
    SCRAPBOX_CONNECT_SID: v.optional(v.string()),
    SCRAPBOX_INDEX_PAGE: v.string(),
    SCRAPBOX_PROJECT: v.string(),
  }),
  process.env,
)
