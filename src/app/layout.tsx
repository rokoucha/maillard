export const dynamic = 'error'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
