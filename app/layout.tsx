import type { Metadata } from 'next'
import './globals.css'
import Nav from './components/Nav'

export const metadata: Metadata = {
  title: '2GET Perth — Find a Tradie',
  description: 'Perth\'s home for trusted trades. Compare, book and pay local tradies — free to use.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  )
}