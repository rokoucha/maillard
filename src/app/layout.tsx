import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import pkg from '../../package.json' assert { type: 'json' }
import { BASE_URL, SCRAPBOX_INDEX_PAGE, SITE_LANG, SITE_NAME } from '../lib/env'
import { getPage } from '../lib/scrapbox'
import './styles.css'

export const dynamic = 'error'

export async function generateMetadata(): Promise<Metadata> {
  const indexPage = await getPage(SCRAPBOX_INDEX_PAGE)
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
          as="style"
          crossOrigin="anonymous"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
          onLoad={"this.rel='stylesheet'" as any}
          referrerPolicy="no-referrer"
          rel="preload"
        />
        <link
          as="font"
          crossOrigin="anonymous"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-brands-400.woff2"
          referrerPolicy="no-referrer"
          rel="preload"
          type="font/woff2"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
