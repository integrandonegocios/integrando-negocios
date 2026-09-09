export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return <article className="rounded-2xl border border-border bg-surface p-6 shadow-sm"><p className="text-sm font-semibold text-text-secondary">{label}</p><p className="mt-3 text-3xl font-bold text-text-primary">{value}</p>{detail && <p className="mt-2 text-xs text-text-muted">{detail}</p>}</article>;
}
