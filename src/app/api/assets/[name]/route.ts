import {
  findInternalImageByName,
  listInternalImages,
} from '../../../../lib/actions/internalimage'

export const dynamic = 'force-static'

export async function generateStaticParams(): Promise<
  {
    name: string
  }[]
> {
  const images = await listInternalImages()

  return images.map((image) => ({
    name: image.name,
  }))
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
): Promise<Response> {
  const { name } = await params

  const image = await findInternalImageByName(name)

  if (!image) {
    return new Response('not found', { status: 404 })
  }

  return new Response(image.data)
}
