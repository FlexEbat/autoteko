import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  text: string
  action?: ReactNode
}

export function EmptyState({ title, text, action }: EmptyStateProps): ReactNode {
  return (
    <div className="flex flex-col items-start gap-2 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted">{text}</p>
      {action}
    </div>
  )
}
