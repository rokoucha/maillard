import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import pkg from '../../package.json' assert { type: 'json' }
import { fetchPage } from '../lib/cosense'
import { BASE_URL, SCRAPBOX_INDEX_PAGE, SITE_LANG, SITE_NAME } from '../lib/env'
import './styles.css'

export const dynamic = 'error'

export async function generateMetadata(): Promise<Metadata> {
  const indexPage = await fetchPage(SCRAPBOX_INDEX_PAGE)
  if (!indexPage) {
    notFound()
  }

  return {
    title: {
      default: SITE_NAME,
      template: `%s - ${SITE_NAME}`,
    },
    applicationName: pkg.name,
    generator: pkg.name,
    openGraph: {
      title: {
        default: SITE_NAME,
        template: `%s - ${SITE_NAME}`,
      },
      siteName: SITE_NAME,
      locale: SITE_LANG,
    },
    icons: indexPage.image,
    twitter: {
      card: 'summary',
      title: {
        default: SITE_NAME,
        template: `%s - ${SITE_NAME}`,
      },
    },
    metadataBase: new URL(BASE_URL),
    alternates: {
      types: {
        'application/feed+json': [
          {
            title: SITE_NAME,
            url: `/api/feed`,
          },
        ],
      },
    },
  }
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default function RootLayout({
  children,
}: RootLayoutProps): React.ReactNode {
  return (
    <html lang={SITE_LANG}>
      <head>
        <link
          as="font"
          crossOrigin="anonymous"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/webfonts/fa-brands-400.woff2"
          referrerPolicy="no-referrer"
          rel="preload"
          type="font/woff2"
        />
        <link
          as="font"
          crossOrigin="anonymous"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/webfonts/fa-solid-900.woff2"
          referrerPolicy="no-referrer"
          rel="preload"
          type="font/woff2"
        />
        <link
          crossOrigin="anonymous"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/brands.min.css"
          integrity="sha512-7rXIvd/xj1FnI2zKQjjXzDFxC4twqBByp8yxOgEQJs4C/aNzNyoQsOO7VxH0RgYNhbAYLJLwzqslaP50KTTHIQ=="
          referrerPolicy="no-referrer"
          rel="stylesheet"
        />
        <link
          crossOrigin="anonymous"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/solid.min.css"
          integrity="sha512-bdqdas3Yr82pkTg5i0X1gcAT3tBXz/8H3J1ec7RyEKAvr/YiSCJNV2dnkukmL8CicjKb9rxmd+ILK8Kg2o2wvQ=="
          referrerPolicy="no-referrer"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
