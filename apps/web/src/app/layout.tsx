import type { Metadata } from 'next'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { DEFAULT_LANG, t } from '../i18n/index.ts'
import './globals.css'

export const metadata: Metadata = { title: t(DEFAULT_LANG, 'app.name') }

export default async function RootLayout({ children }: { children: ReactNode }): Promise<ReactNode> {
  // Pages render per request so every response can carry its own CSP nonce.
  await connection()
  return (
    <html lang={DEFAULT_LANG}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:bg-surface focus:p-2">
          {t(DEFAULT_LANG, 'app.skip_to_content')}
        </a>
        {children}
      </body>
    </html>
  )
}
