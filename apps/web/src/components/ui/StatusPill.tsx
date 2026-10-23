import type { DealStatus, QuoteStatus } from '@auteko/shared/types'
import type { ReactNode } from 'react'
import { Badge } from './Badge.tsx'

export interface StatusPillProps {
  status: DealStatus | QuoteStatus
  label: string
  overdue?: boolean | undefined
  overdueLabel?: string | undefined
}

const TONES: Readonly<Record<DealStatus | QuoteStatus, 'neutral' | 'success' | 'warning' | 'danger'>> = {
  new: 'neutral',
  confirmed: 'neutral',
  shipped: 'warning',
  done: 'success',
  cancelled: 'danger',
  draft: 'neutral',
  sent: 'neutral',
  accepted: 'success',
  rejected: 'danger',
  expired: 'warning',
}

export function StatusPill({ status, label, overdue, overdueLabel }: StatusPillProps): ReactNode {
  return (
    <span className="inline-flex flex-wrap gap-1">
      <Badge tone={TONES[status]}>{label}</Badge>
      {overdue && overdueLabel ? <Badge tone="danger">{overdueLabel}</Badge> : null}
    </span>
  )
}
