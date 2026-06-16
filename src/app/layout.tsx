import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shine To Freedom — Freedom Starts With One Opportunity',
  description: 'Join thousands of Africans discovering new ways to earn, learn, and grow in the digital economy.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}