import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'App Mercado Libre – Vitrina',
  description: 'Registro y dashboard para eventos de Mercado Libre',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-ml-gray">
        {children}
      </body>
    </html>
  )
}
