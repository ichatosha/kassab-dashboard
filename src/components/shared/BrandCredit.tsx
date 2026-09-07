// The agency credit shown on every public-facing surface. One component so
// the wording and the link stay identical everywhere.
export const BRANDME_URL = 'https://brand1me.com/'

export function BrandCredit({ className = '', prefix }: { className?: string; prefix?: string }) {
  return (
    <p className={className} dir="ltr">
      {prefix}
      <a
        href={BRANDME_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer underline-offset-2 transition-colors hover:text-brand-500 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        Designed &amp; Developed by BrandMe Agency [HΣ]
      </a>
    </p>
  )
}
