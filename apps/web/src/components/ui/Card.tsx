import type { ReactNode } from 'react'

export interface CardProps {
  title: string
  children: ReactNode
  href?: string | undefined
}

const CARD_CLASS = 'block rounded border border-line bg-surface p-4'

// A link card must not hold other interactive elements inside.
export function Card({ title, children, href }: CardProps): ReactNode {
  const body = (
    <>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div>{children}</div>
    </>
  )
  return href ? (
    <a href={href} className={`${CARD_CLASS} text-ink no-underline hover:border-brand`}>
      {body}
    </a>
  ) : (
    <section className={CARD_CLASS}>{body}</section>
  )
}
