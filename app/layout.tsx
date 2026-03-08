import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Serif_Ethiopic } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/components/query-provider'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const notoSerifEthiopic = Noto_Serif_Ethiopic({ 
  subsets: ["ethiopic", "latin"],
  variable: '--font-ethiopic',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Smart Knowledge Ethiopia | AI-Powered Learning Platform',
  description: 'Access books, research materials, and AI-assisted learning tools designed for Ethiopian students and researchers.',
  keywords: ['Ethiopia', 'education', 'AI', 'books', 'research', 'learning', 'students'],
  authors: [{ name: 'Smart Knowledge Ethiopia' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0B6E4F' },
    { media: '(prefers-color-scheme: dark)', color: '#2DB87F' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSerifEthiopic.variable} font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
