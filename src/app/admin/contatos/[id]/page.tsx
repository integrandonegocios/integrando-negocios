import { notFound } from "next/navigation";
import { setLeadStatus } from "@/actions/admin";
import { PageHeader } from "@/components/admin/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("contacts.read"); const { id } = await params;
  const lead = await db.contactLead.findUnique({ where: { id }, include: { assignedTo: true } }); if (!lead) notFound();
  return <><PageHeader title={lead.name} description={`${lead.email}${lead.company ? ` · ${lead.company}` : ""}`} /><div className="grid gap-6 lg:grid-cols-[1fr_22rem]"><article className="rounded-2xl border border-border bg-surface p-6"><h2 className="font-bold">Mensagem</h2><p className="mt-4 whitespace-pre-wrap leading-7 text-text-secondary">{lead.message}</p><dl className="mt-8 grid gap-4 border-t border-border pt-6 text-sm sm:grid-cols-2"><div><dt className="text-text-muted">Telefone</dt><dd className="font-semibold">{lead.phone || "Não informado"}</dd></div><div><dt className="text-text-muted">Recebido em</dt><dd className="font-semibold">{lead.createdAt.toLocaleString("pt-BR")}</dd></div></dl></article><aside className="rounded-2xl border border-border bg-surface p-6"><h2 className="font-bold">Atendimento</h2><form action={setLeadStatus} className="mt-4 space-y-4"><input name="id" type="hidden" value={lead.id}/><select className="w-full rounded-lg border border-border-strong p-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20" defaultValue={lead.status} name="status"><option value="NEW">Novo</option><option value="IN_PROGRESS">Em andamento</option><option value="WON">Ganho</option><option value="LOST">Perdido</option></select><SubmitButton className="w-full">Atualizar status</SubmitButton></form></aside></div></>;
}
