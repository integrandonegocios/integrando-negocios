import { saveService, toggleService } from "@/actions/admin";
import { PageHeader } from "@/components/admin/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { serviceIcons } from "@/lib/validation";

const field = "mt-2 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 focus:outline-2 focus:outline-brand-primary";
function ServiceForm({ item }: { item?: { id: string; title: string; description: string; icon: string; position: number } }) {
  return <form action={saveService} className="mt-5 grid gap-4 md:grid-cols-2">
    <input name="id" type="hidden" value={item?.id ?? ""} />
    <label>Título<input className={field} defaultValue={item?.title} name="title" minLength={2} maxLength={120} required /></label>
    <label>Ícone<select className={field} defaultValue={serviceIcons.includes(item?.icon as typeof serviceIcons[number]) ? item?.icon : "systems"} name="icon">{serviceIcons.map(icon => <option key={icon} value={icon}>{icon}</option>)}</select></label>
    <label className="md:col-span-2">Descrição<textarea className={field} defaultValue={item?.description} name="description" minLength={10} maxLength={2000} required rows={4} /></label>
    <label>Posição<input className={field} defaultValue={item?.position ?? 0} min={0} max={10000} name="position" type="number" required /></label>
    <div className="md:col-span-2"><SubmitButton>{item ? "Salvar alterações" : "Criar serviço"}</SubmitButton></div>
  </form>;
}
export default async function ServicesPage() {
  await requirePermission("services.manage");
  const services = await db.service.findMany({ orderBy: [{ position: "asc" }, { title: "asc" }] });
  return <><PageHeader title="Serviços" description="O primeiro serviço ativo na ordem recebe destaque no site." />
    <details className="mb-6 rounded-2xl border border-border bg-surface p-5"><summary className="cursor-pointer font-bold">Novo serviço</summary><ServiceForm /></details>
    <div className="grid gap-4 sm:grid-cols-2">{services.map(item => <article className="rounded-2xl border border-border bg-surface p-5" key={item.id}>
      <h2 className="font-bold">{item.title}</h2><p className="mt-2 text-sm">{item.active ? "Ativo" : "Inativo"} · Posição {item.position}</p>
      <details className="mt-4"><summary className="cursor-pointer font-semibold">Editar serviço</summary><ServiceForm item={item} /></details>
      <form action={toggleService} className="mt-4"><input name="id" type="hidden" value={item.id} /><input name="active" type="hidden" value={String(!item.active)} /><SubmitButton>{item.active ? "Desativar" : "Ativar"}</SubmitButton></form>
    </article>)}</div>
  </>;
}
