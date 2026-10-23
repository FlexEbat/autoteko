import type { ReactNode } from 'react'

export interface Column<Row> {
  key: string
  header: string
  render: (row: Row) => ReactNode
}

export interface TableProps<Row> {
  columns: readonly Column<Row>[]
  rows: readonly Row[]
  emptyText: string
  caption: string
}

export function Table<Row>({ columns, rows, emptyText, caption }: TableProps<Row>): ReactNode {
  if (rows.length === 0) return <p>{emptyText}</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <caption className="pb-2 text-left font-medium">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="border-b border-line px-3 py-2">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key} className="border-b border-line/40 px-3 py-2">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
