import type { DealStatus, StockStatus } from './types.ts'

// red at balance <= 0, yellow from 1 up to and including the threshold, green above it.
export function stockStatus(balance: number, threshold: number): StockStatus {
  if (balance <= 0) return 'red'
  return balance <= threshold ? 'yellow' : 'green'
}

export interface Balance {
  received: number
  sold: number
  balance: number
}

// Cancelled deals do not reduce the balance.
export function computeBalance(
  received: number,
  deals: readonly { quantity: number; status: DealStatus }[],
): Balance {
  const sold = deals.reduce((sum, deal) => (deal.status === 'cancelled' ? sum : sum + deal.quantity), 0)
  return { received, sold, balance: received - sold }
}
