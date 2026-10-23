import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DEFAULT_LANG, t } from '../../i18n/index.ts'

export const metadata: Metadata = { title: t(DEFAULT_LANG, 'home.title') }

export default function HomePage(): ReactNode {
  return (
    <>
      <h1 className="text-2xl font-bold">{t(DEFAULT_LANG, 'home.heading')}</h1>
      <p className="text-muted">{t(DEFAULT_LANG, 'home.lead')}</p>
    </>
  )
}
