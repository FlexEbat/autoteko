import type { StockStatus } from '@auteko/shared/types'
import type { ReactNode } from 'react'
import { Badge } from './Badge.tsx'

export interface StockBadgeProps {
  status: StockStatus
  balance: number
  label: string
}

const TONES = { green: 'success', yellow: 'warning', red: 'danger' } as const

// Status is carried by color and by the label text.
export function StockBadge({ status, balance, label }: StockBadgeProps): ReactNode {
  return (
    <Badge tone={TONES[status]}>
      {label}: {balance}
    </Badge>
  )
}
