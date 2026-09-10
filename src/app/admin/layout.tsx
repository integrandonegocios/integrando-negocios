import { logout } from "@/actions/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await db.notification.count({ where: { userId: user.id, readAt: null } });
  return <div className="min-h-svh bg-background-secondary"><Sidebar permissions={user.permissions} /><div className="lg:pl-72"><header className="flex min-h-20 items-center justify-between border-b border-border bg-surface px-5 sm:px-8"><div><p className="text-sm font-bold text-text-primary">{user.name}</p><p className="text-xs text-text-muted">{user.roles.join(" · ")}</p></div><div className="flex items-center gap-3"><a className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-primary transition hover:border-brand-primary hover:text-brand-primary-hover" href="/admin/notificacoes">Notificações {unread > 0 && <span className="ml-1 rounded-full bg-brand-primary px-1.5 py-0.5 text-xs text-text-primary">{unread}</span>}</a><a className="rounded-lg px-3 py-2 text-sm font-semibold" href="/admin/configuracoes/seguranca">Segurança</a><form action={logout}><button className="rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-brand-primary-subtle" type="submit">Sair</button></form></div></header><main className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">{children}</main></div></div>;
}
