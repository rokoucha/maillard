export async function digestSHA1(input: string) {
  const data = new TextEncoder().encode(input)

  const digest = await crypto.subtle.digest(
    {
      name: 'SHA-1',
    },
    data,
  )

  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
