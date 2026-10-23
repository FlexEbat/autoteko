import type { ReactNode } from 'react'

export interface BadgeProps {
  tone: 'neutral' | 'success' | 'warning' | 'danger'
  children: ReactNode
}

const TONES = {
  neutral: 'border-line text-ink',
  success: 'border-success text-success',
  warning: 'border-warning text-warning',
  danger: 'border-danger text-danger',
} as const

export function Badge({ tone, children }: BadgeProps): ReactNode {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-sm font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}
