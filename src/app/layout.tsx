import { type Metadata } from 'next'
import pkg from '../../package.json' assert { type: 'json' }
import { BASE_URL, SITE_NAME } from '../lib/env'

export const dynamic = 'error'

export const metadata = {
  title: {
    default: SITE_NAME,
    template: `%s - ${SITE_NAME}`,
  },
  robots: {
    follow: false,
    index: false,
  },
  applicationName: pkg.name,
  generator: pkg.name,
  openGraph: {
    title: {
      default: SITE_NAME,
      template: `%s - ${SITE_NAME}`,
    },
    siteName: SITE_NAME,
    locale: process.env.SITE_LANG,
  },
  icons: undefined,
  twitter: {
    card: 'summary',
    title: {
      default: SITE_NAME,
      template: `%s - ${SITE_NAME}`,
    },
    images: undefined,
  },
  metadataBase: new URL(BASE_URL),
} satisfies Metadata

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default function RootLayout({
  children,
}: RootLayoutProps): React.ReactNode {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
