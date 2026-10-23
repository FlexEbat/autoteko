import type { ReactNode } from 'react'

export interface HeaderProps {
  appName: string
}

export function Header({ appName }: HeaderProps): ReactNode {
  return (
    <header className="border-b border-line px-4 py-3">
      <p className="text-lg font-bold">{appName}</p>
    </header>
  )
}
