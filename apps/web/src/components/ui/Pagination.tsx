import type { ReactNode } from 'react'

export interface PaginationProps {
  page: number
  limit: number
  total: number
  hrefFor: (page: number) => string
  labels: { nav: string; previous: string; next: string }
}

// Shows the first, last and nearby pages as numbers.
function visiblePages(page: number, pages: number): (number | null)[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1])
  const sorted = [...wanted].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
  const result: (number | null)[] = []
  sorted.forEach((n, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && n - previous > 1) result.push(null)
    result.push(n)
  })
  return result
}

const LINK_CLASS = 'inline-flex min-h-9 min-w-9 items-center justify-center rounded border border-line px-2'

export function Pagination({ page, limit, total, hrefFor, labels }: PaginationProps): ReactNode {
  const pages = Math.max(1, Math.ceil(total / limit))
  if (pages === 1) return null
  return (
    <nav aria-label={labels.nav}>
      <ul className="flex flex-wrap items-center gap-1">
        {page > 1 ? (
          <li>
            <a href={hrefFor(page - 1)} className={LINK_CLASS}>
              {labels.previous}
            </a>
          </li>
        ) : null}
        {visiblePages(page, pages).map((n, index) => (
          <li key={n ?? `gap-${index}`}>
            {n === null ? (
              <span aria-hidden="true">…</span>
            ) : n === page ? (
              <span
                aria-current="page"
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded border-2 border-brand font-semibold"
              >
                {n}
              </span>
            ) : (
              <a
                href={hrefFor(n)}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded border border-line"
              >
                {n}
              </a>
            )}
          </li>
        ))}
        {page < pages ? (
          <li>
            <a href={hrefFor(page + 1)} className={LINK_CLASS}>
              {labels.next}
            </a>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}
