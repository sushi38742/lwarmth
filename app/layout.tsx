import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Warm Path Finder | Synopsis GTM',
  description: 'Internal GTM tool for finding warm intro paths into target accounts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F7F7F5] text-[#0D0D0D] min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
