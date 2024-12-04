import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants'
import { fetchCode, fetchCodes } from '../../../../lib/cosense'

export const dynamic = 'force-static'

type Params = Readonly<{ slug: string[] }>

export async function generateStaticParams(): Promise<Params[]> {
  const codes = await fetchCodes()

  return codes.map((code) => ({
    slug:
      process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD
        ? code.split('/')
        : code.split('/').map((c) => encodeURIComponent(c)),
  }))
}

export async function GET(
  _: Request,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  const slug = await params.then(({ slug }) => slug.join('/'))

  const code = await fetchCode(slug)
  if (!code) {
    return new Response('Not Found', { status: 404 })
  }

  return new Response(code)
}
