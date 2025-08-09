import { listInternalImages } from '../../../../lib/actions/cosense'

export const dynamic = 'force-static'

export async function generateStaticParams(): Promise<
  {
    name: string[]
  }[]
> {
  const images = await listInternalImages()

  return images.map((image) => ({
    name: [image],
  }))
}
