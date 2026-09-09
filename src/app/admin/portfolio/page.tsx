import { PageHeader } from "@/components/admin/page-header";
import { DeletePortfolioCaseButton } from "@/components/admin/delete-portfolio-case-button";
import { PortfolioCaseForm } from "@/components/admin/portfolio-case-form";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function PortfolioPage() {
  await requirePermission("portfolio.manage");
  const items = await db.portfolioCase.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader title="Portfólio" description="Cases e histórias publicados no site." />
      <details className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <summary className="cursor-pointer font-bold text-brand-primary-hover">Novo case</summary>
        <PortfolioCaseForm />
      </details>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article className="rounded-2xl border border-border bg-surface p-5" key={item.id}>
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="mb-4 aspect-[16/7] w-full rounded-lg border border-border object-cover" loading="lazy" src={item.imageUrl} />
            )}
            <span className="text-xs font-bold text-brand-primary-hover">{item.status}</span>
            <h2 className="mt-2 font-bold">{item.title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{item.summary}</p>
            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-text-muted">Ações do projeto</p>
              <div className="flex flex-wrap items-start gap-3">
              <details className="min-w-0 flex-1">
                <summary className="w-fit cursor-pointer list-none rounded-lg border border-border-strong bg-background-secondary px-4 py-2.5 text-sm font-bold text-text-primary transition hover:border-brand-primary hover:text-brand-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">Editar projeto</summary>
                <div className="mt-4 border-t border-border pt-1">
                  <PortfolioCaseForm project={{ id: item.id, title: item.title, summary: item.summary, content: item.content, imageUrl: item.imageUrl, galleryUrls: item.galleryUrls, status: item.status }} />
                </div>
              </details>
              <DeletePortfolioCaseButton id={item.id} title={item.title} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
