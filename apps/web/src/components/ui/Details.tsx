import type { ReactNode } from 'react'

export interface DetailsProps {
  summary: string
  children: ReactNode
}

// Native disclosure: confirms a destructive action without JavaScript or browser dialogs.
export function Details({ summary, children }: DetailsProps): ReactNode {
  return (
    <details className="rounded border border-line p-3">
      <summary className="min-h-6 cursor-pointer font-medium">{summary}</summary>
      <div className="pt-3">{children}</div>
    </details>
  )
}
