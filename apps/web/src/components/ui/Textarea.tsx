import type { ReactNode } from 'react'
import { CONTROL_CLASS, Field } from './Field.tsx'

export interface TextareaProps {
  name: string
  label: string
  value?: string | undefined
  error?: string | undefined
  maxLength?: number | undefined
}

export function Textarea({ name, label, value, error, maxLength }: TextareaProps): ReactNode {
  return (
    <Field label={label} error={error}>
      <textarea name={name} defaultValue={value} maxLength={maxLength} rows={4} className={CONTROL_CLASS} />
    </Field>
  )
}
