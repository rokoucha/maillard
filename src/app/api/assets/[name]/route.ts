import { getInternalImages } from '../../../../lib/actions/cosense'

export const dynamic = 'force-static'

export async function generateStaticParams(): Promise<
  {
    name: string
  }[]
> {
  const images = await getInternalImages()

  return images.map((image) => ({
    name: image.name,
  }))
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
): Promise<Response> {
  const { name } = await params

  const images = await getInternalImages()
  const image = images.find((i) => i.name === name)

  if (!image) {
    return new Response('not found', { status: 404 })
  }

  return new Response(image.image)
}
