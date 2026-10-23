import type { ReactNode } from 'react'

export interface ToolbarProps {
  children: ReactNode
}

export function Toolbar({ children }: ToolbarProps): ReactNode {
  return <div className="flex flex-wrap items-end gap-3">{children}</div>
}
