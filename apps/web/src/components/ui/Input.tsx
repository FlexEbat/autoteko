import type { ReactNode } from 'react'
import { CONTROL_CLASS, Field } from './Field.tsx'

export interface InputProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'search' | 'tel' | undefined
  value?: string | undefined
  error?: string | undefined
  hint?: string | undefined
  required?: boolean | undefined
  maxLength?: number | undefined
}

export function Input({
  name,
  label,
  type = 'text',
  value,
  error,
  hint,
  required,
  maxLength,
}: InputProps): ReactNode {
  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        maxLength={maxLength}
        className={CONTROL_CLASS}
      />
    </Field>
  )
}
