import type { ReactNode } from 'react'
import { Header } from '../../components/layout/Header.tsx'
import { DEFAULT_LANG, t } from '../../i18n/index.ts'

export default function AppLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <>
      <Header appName={t(DEFAULT_LANG, 'app.name')} />
      <main id="main" className="mx-auto max-w-5xl p-4">
        {children}
      </main>
    </>
  )
}
