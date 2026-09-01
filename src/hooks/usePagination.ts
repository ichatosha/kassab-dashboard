import { useMemo, useState } from 'react'

export function usePagination<T>(rows: T[], pageSize = 12) {
  const [rawPage, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  // Clamp during render so a shrinking filtered set never strands the user
  // on an empty page (no effect needed, no cascading render).
  const page = Math.min(rawPage, pageCount)

  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize],
  )

  return { page, setPage, pageCount, pageRows, total: rows.length, pageSize }
}
