export interface SqlQuery {
  text: string
  values: unknown[]
}

function isSqlQuery(value: unknown): value is SqlQuery {
  return (
    typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    'values' in value &&
    SQL_BRAND.has(value)
  )
}

const SQL_BRAND = new WeakSet<object>()

function brand(query: SqlQuery): SqlQuery {
  SQL_BRAND.add(query)
  return query
}

// Tagged template: every interpolated value becomes a numbered parameter.
// A fragment built by sql or ident is spliced in, with its parameters renumbered.
export function sql(strings: TemplateStringsArray, ...values: unknown[]): SqlQuery {
  let text = strings[0] ?? ''
  const params: unknown[] = []
  values.forEach((value, index) => {
    if (isSqlQuery(value)) {
      const offset = params.length
      text += value.text.replace(/\$(\d+)/g, (_, n: string) => `$${Number(n) + offset}`)
      params.push(...value.values)
    } else {
      params.push(value)
      text += `$${params.length}`
    }
    text += strings[index + 1] ?? ''
  })
  return brand({ text, values: params })
}

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/

// A column or table name taken from a fixed allow list, for ORDER BY and similar places.
export function ident(name: string, allowed: readonly string[]): SqlQuery {
  if (!allowed.includes(name) || !IDENTIFIER.test(name)) {
    throw new RangeError(`identifier is not allowed: ${name}`)
  }
  return brand({ text: `"${name}"`, values: [] })
}
