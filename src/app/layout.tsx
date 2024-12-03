import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Map Application',
  description: 'Interactive map application with drawing capabilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}