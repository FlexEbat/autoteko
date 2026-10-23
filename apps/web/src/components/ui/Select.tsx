import type { ReactNode } from 'react'
import { CONTROL_CLASS, Field } from './Field.tsx'

export interface SelectProps {
  name: string
  label: string
  options: readonly { value: string; label: string }[]
  value?: string | undefined
  error?: string | undefined
}

export function Select({ name, label, options, value, error }: SelectProps): ReactNode {
  return (
    <Field label={label} error={error}>
      <select name={name} defaultValue={value} className={CONTROL_CLASS}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
