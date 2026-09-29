import Link from "next/link";
export function Pagination({ page, hasNext, path, filters = {} }: { page: number; hasNext: boolean; path: string; filters?: Record<string, string> }) {
  if (page === 1 && !hasNext) return null;
  const href = (target: number) => `${path}?${new URLSearchParams({ ...filters, page: String(target) })}`;
  return <nav aria-label="Paginação" className="mt-8 flex items-center justify-between gap-4">
    {page > 1 ? <Link className="rounded-lg border border-border px-4 py-3 font-semibold" href={href(page - 1)}>← Anterior</Link> : <span />}
    <span aria-current="page">Página {page}</span>
    {hasNext ? <Link className="rounded-lg border border-border px-4 py-3 font-semibold" href={href(page + 1)}>Próxima →</Link> : <span />}
  </nav>;
}
