import type { ReactNode } from 'react'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | undefined
  type?: 'button' | 'submit' | undefined
  disabled?: boolean | undefined
  formAction?: ((formData: FormData) => void | Promise<void>) | string | undefined
  children: ReactNode
}

const VARIANTS = {
  primary: 'border-brand bg-brand text-brand-ink',
  secondary: 'border-line bg-surface text-ink',
  danger: 'border-danger bg-danger text-brand-ink',
} as const

// A native button. The label names the action, so danger never relies on color alone.
export function Button({
  variant = 'primary',
  type = 'button',
  disabled,
  formAction,
  children,
}: ButtonProps): ReactNode {
  return (
    <button
      type={type}
      disabled={disabled}
      formAction={formAction}
      className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded border px-4 py-1.5 font-medium disabled:opacity-60 ${VARIANTS[variant]}`}
    >
      {children}
    </button>
  )
}
