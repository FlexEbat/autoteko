'use client'

import type { ReactNode } from 'react'
import { Alert } from '../components/ui/Alert.tsx'
import { Button } from '../components/ui/Button.tsx'
import { DEFAULT_LANG, t } from '../i18n/index.ts'

// The page shows no stack or path: the message is fixed text from the dictionary.
export default function ErrorPage({ reset }: { error: Error; reset: () => void }): ReactNode {
  return (
    <main id="main" className="mx-auto max-w-5xl p-4">
      <h1 className="text-2xl font-bold">{t(DEFAULT_LANG, 'crash.heading')}</h1>
      <Alert tone="danger">{t(DEFAULT_LANG, 'crash.text')}</Alert>
      <form>
        <Button variant="secondary" type="submit" formAction={() => reset()}>
          {t(DEFAULT_LANG, 'crash.retry')}
        </Button>
      </form>
    </main>
  )
}
