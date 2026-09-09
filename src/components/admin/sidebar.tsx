import Image from "next/image";
import Link from "next/link";

const items = [
  ["/admin", "Visão geral", "dashboard.read"], ["/admin/contatos", "Contatos", "contacts.read"],
  ["/admin/usuarios", "Usuários", "users.read"], ["/admin/perfis", "Perfis e permissões", "roles.manage"],
  ["/admin/servicos", "Serviços", "services.manage"], ["/admin/portfolio", "Portfólio", "portfolio.manage"],
  ["/admin/relatorios", "Relatórios", "reports.read"], ["/admin/auditoria", "Auditoria", "audit.read"],
  ["/admin/notificacoes", "Notificações", "dashboard.read"], ["/admin/configuracoes", "Configurações", "settings.manage"],
] as const;

export function Sidebar({ permissions }: { permissions: Set<string> }) {
  return <aside className="border-b border-text-inverse/10 bg-surface-inverse text-text-inverse lg:fixed lg:inset-y-0 lg:w-72 lg:border-b-0 lg:border-r"><div className="flex h-20 items-center justify-between px-5 lg:h-24"><Link href="/admin"><Image alt="Integrando Negócios" className="h-12 w-auto brightness-0 invert" height={220} src="/logo.png" width={460} /></Link><span className="rounded-full bg-text-inverse/10 px-3 py-1 text-xs font-semibold lg:hidden">Menu</span></div><nav aria-label="Menu administrativo" className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">{items.filter(([, , permission]) => permissions.has(permission)).map(([href, label]) => <Link className="block shrink-0 rounded-xl px-4 py-3 text-sm font-semibold text-text-inverse-muted transition hover:bg-brand-primary/15 hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" href={href} key={href}>{label}</Link>)}</nav></aside>;
}
