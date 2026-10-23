import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Header } from '../components/layout/Header.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { DEFAULT_LANG, t } from '../i18n/index.ts'

export const metadata: Metadata = { title: t(DEFAULT_LANG, 'notfound.title') }

export default function NotFound(): ReactNode {
  return (
    <>
      <Header appName={t(DEFAULT_LANG, 'app.name')} />
      <main id="main" className="mx-auto max-w-5xl p-4">
        <h1 className="text-2xl font-bold">{t(DEFAULT_LANG, 'notfound.heading')}</h1>
        <EmptyState
          title={t(DEFAULT_LANG, 'notfound.title')}
          text={t(DEFAULT_LANG, 'notfound.text')}
          action={<a href="/">{t(DEFAULT_LANG, 'notfound.home')}</a>}
        />
      </main>
    </>
  )
}
