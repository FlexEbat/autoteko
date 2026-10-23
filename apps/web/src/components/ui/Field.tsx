import { cloneElement, useId, type ReactElement, type ReactNode } from 'react'

export interface FieldProps {
  label: string
  error?: string | undefined
  hint?: string | undefined
  required?: boolean | undefined
  children: ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>
}

// Ties the label, hint and error text to the single control passed as children.
export function Field({ label, error, hint, required, children }: FieldProps): ReactNode {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : undefined, error ? errorId : undefined].filter(Boolean).join(' ')
  const control = cloneElement(children, {
    id,
    ...(error ? { 'aria-invalid': true } : {}),
    ...(describedBy ? { 'aria-describedby': describedBy } : {}),
  })
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {control}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const CONTROL_CLASS =
  'min-h-9 w-full rounded border border-line bg-surface px-3 py-1.5 text-ink aria-[invalid=true]:border-danger aria-[invalid=true]:border-2'
