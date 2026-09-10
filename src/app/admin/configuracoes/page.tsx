import { saveSetting } from "@/actions/admin";
import { PageHeader } from "@/components/admin/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  await requirePermission("settings.manage");

  const items = await db.appSetting.findMany({
    orderBy: {
      key: "asc",
    },
  });

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Parâmetros não sensíveis da aplicação."
      />

      <a className="mb-6 inline-block font-semibold underline" href="/admin/configuracoes/seguranca">Alterar minha senha</a>

      <form
        action={saveSetting}
        className="flex max-w-2xl flex-col gap-3 rounded-2xl bg-surface p-6"
      >
        <label className="text-sm font-semibold">
          Chave
          <input
            className="mt-2 w-full rounded-lg border border-border-strong p-3 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            name="key"
            placeholder="company.phone"
            required
          />
        </label>

        <label className="text-sm font-semibold">
          Valor
          <input
            className="mt-2 w-full rounded-lg border border-border-strong p-3 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            name="value"
            required
          />
        </label>

        <div>
          <SubmitButton>Salvar configuração</SubmitButton>
        </div>
      </form>

      <div className="mt-6 max-w-2xl divide-y divide-border rounded-2xl bg-surface px-6">
        {items.map((item) => (
          <div
            className="flex justify-between gap-4 py-4 text-sm"
            key={item.key}
          >
            <strong>{item.key}</strong>
            <span className="break-all text-text-muted">
              {String(item.value)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}