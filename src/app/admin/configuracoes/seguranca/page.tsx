import { PageHeader } from "@/components/admin/page-header";
import { PasswordForm } from "@/components/forms/password-form";
import { requireUser } from "@/lib/auth/session";
export const metadata = { title: "Segurança da conta" };
export default async function SecurityPage() {
  await requireUser();
  return <><PageHeader title="Segurança da conta" description="Altere sua senha. As outras sessões serão encerradas após a alteração." /><section className="max-w-2xl rounded-2xl border border-border bg-surface p-6"><h2 className="text-lg font-bold">Alterar senha</h2><PasswordForm mode="change" /></section></>;
}
