import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agent de News Telegram',
  description: 'Agent automatique de recherche et publication de news sur Telegram',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
