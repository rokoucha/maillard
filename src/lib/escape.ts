export function cosensePageTitleEscape(title: string) {
  return title
    .replaceAll('/', '%2F')
    .replaceAll('?', '%3F')
    .replaceAll('#', '%23')
}
