import type { Metadata } from 'next'
import { Space_Mono } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/ui/ThemeProvider'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'GlobalWatch — Real-Time Global Intelligence Dashboard',
  description:
    'Live global monitoring: conflicts, earthquakes, wildfires, ' +
    'flights, disasters and breaking news. Real-time intelligence dashboard.',
  keywords: [
    'global intelligence', 'real-time map', 'conflict tracker',
    'earthquake map', 'flight tracker', 'wildfire map',
    'global news', 'geopolitical dashboard', 'situational awareness',
    'OSINT', 'open source intelligence',
  ],
  openGraph: {
    title: 'GlobalWatch — Real-Time Global Intelligence',
    description: 'Live conflict, earthquake, fire, flight and news monitoring.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalWatch — Real-Time Global Intelligence',
    description: 'Live global monitoring dashboard.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceMono.variable}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
