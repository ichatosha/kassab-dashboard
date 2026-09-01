import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  align?: 'start' | 'end' | 'center'
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyState?: ReactNode
  stickyHeader?: boolean
}

const alignClass = { start: 'text-start', end: 'text-end', center: 'text-center' }

export function DataTable<T>({ columns, rows, rowKey, onRowClick, emptyState, stickyHeader }: DataTableProps<T>) {
  if (rows.length === 0 && emptyState) return <>{emptyState}</>

  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className={`border-b border-ink-200 bg-ink-50/70 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500 ${alignClass[c.align ?? 'start']} ${c.className ?? ''}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={`border-b border-ink-100 last:border-b-0 ${
                onRowClick ? 'cursor-pointer transition-colors duration-100 hover:bg-brand-50/40' : ''
              }`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onRowClick(row)
                      }
                    }
                  : undefined
              }
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2.5 align-middle ${alignClass[c.align ?? 'start']} ${c.className ?? ''}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
