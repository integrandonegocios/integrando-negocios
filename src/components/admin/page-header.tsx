export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-brand-accent">Área interna</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">{title}</h1>{description && <p className="mt-2 text-text-secondary">{description}</p>}</div>{action}</div>;
}
