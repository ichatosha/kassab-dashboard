import { useEffect, useMemo, useState } from 'react'

export function usePagination<T>(rows: T[], pageSize = 12) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))

  // Reset when the filtered set shrinks below the current page
  useEffect(() => {
    if (page > pageCount) setPage(1)
  }, [page, pageCount])

  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize],
  )

  return { page, setPage, pageCount, pageRows, total: rows.length, pageSize }
}
