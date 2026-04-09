import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://menulink.page'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'MenuLink.page — One link for your whole restaurant',
    template: '%s | MenuLink.page',
  },
  description:
    'Menu, bookings, reviews, delivery apps, socials — in one QR code on every table. Built for restaurants, not influencers. Free forever for 1 page.',
  keywords: [
    'restaurant link in bio',
    'menu QR code',
    'restaurant linktree',
    'restaurant bio page',
    'menu bio link',
    'restaurant marketing',
    'QR menu',
  ],
  authors: [{ name: 'MenuLink.page' }],
  creator: 'MenuLink.page',
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: APP_URL,
    siteName: 'MenuLink.page',
    title: 'MenuLink.page — One link for your whole restaurant',
    description:
      'Menu, bookings, reviews, delivery apps, socials — all in one QR code. Built for restaurants. Free forever.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenuLink.page — One link for your whole restaurant',
    description:
      'Menu, bookings, reviews, delivery apps, socials — all in one QR code. Free forever.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
            },
          }}
        />
      </body>
    </html>
  )
}
