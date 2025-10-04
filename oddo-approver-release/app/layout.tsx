import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Oddo Approver - Smart Expense Management',
  description: 'A modern expense management system with AI-powered OCR, multi-level approvals, and real-time currency conversion.',
  keywords: 'expense management, OCR, approval workflow, currency conversion, business finance',
  authors: [{ name: 'Oddo Approver Team' }],
  // viewport moved to `export const viewport` per Next.js recommendations
  robots: 'index, follow',
  openGraph: {
    title: 'Oddo Approver - Smart Expense Management',
    description: 'A modern expense management system with AI-powered OCR, multi-level approvals, and real-time currency conversion.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oddo Approver - Smart Expense Management',
    description: 'A modern expense management system with AI-powered OCR, multi-level approvals, and real-time currency conversion.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
