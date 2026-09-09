// ── CSV export ────────────────────────────────────────────────────────
// Small enough to keep: a dependency for turning arrays into a comma-
// separated file would be more code than the file itself. The BOM is what
// makes Excel read the Arabic columns as UTF-8 instead of mojibake.

const escape = (value: string | number) => {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
}

/** Hands the browser a file. Nothing leaves the device. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoke on the next frame so Safari has taken the blob first
  requestAnimationFrame(() => URL.revokeObjectURL(url))
}
