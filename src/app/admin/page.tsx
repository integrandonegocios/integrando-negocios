import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  await requirePermission("dashboard.read");
  const [newLeads, activeUsers, publishedCases, activeServices, recent] = await Promise.all([
    db.contactLead.count({ where: { status: "NEW" } }), db.user.count({ where: { status: "ACTIVE" } }),
    db.portfolioCase.count({ where: { status: "PUBLISHED" } }), db.service.count({ where: { active: true } }),
    db.contactLead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  return <><PageHeader title="Visão geral" description="Acompanhe os principais indicadores da operação." /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Novos contatos" value={newLeads} detail="Aguardando atendimento" /><StatCard label="Usuários ativos" value={activeUsers} /><StatCard label="Cases publicados" value={publishedCases} /><StatCard label="Serviços ativos" value={activeServices} /></section><section className="mt-8 rounded-2xl border border-border bg-surface p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-text-primary">Contatos recentes</h2><Link className="text-sm font-semibold text-brand-primary-hover" href="/admin/contatos">Ver todos →</Link></div><div className="mt-5 divide-y divide-border">{recent.length ? recent.map((lead) => <Link className="flex items-center justify-between gap-4 py-4" href={`/admin/contatos/${lead.id}`} key={lead.id}><div><p className="font-semibold">{lead.name}</p><p className="text-sm text-text-muted">{lead.company || lead.email}</p></div><span className="text-xs font-bold text-brand-primary-hover">{lead.status}</span></Link>) : <p className="py-8 text-center text-text-muted">Nenhum contato recebido ainda.</p>}</div></section></>;
}
