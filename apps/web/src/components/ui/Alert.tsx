import type { ReactNode } from 'react'

export interface AlertProps {
  tone: 'neutral' | 'success' | 'warning' | 'danger'
  children: ReactNode
}

const TONES = {
  neutral: 'border-line',
  success: 'border-success',
  warning: 'border-warning',
  danger: 'border-danger',
} as const

export function Alert({ tone, children }: AlertProps): ReactNode {
  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={`rounded border-l-4 bg-surface p-3 ${TONES[tone]}`}
    >
      {children}
    </div>
  )
}
