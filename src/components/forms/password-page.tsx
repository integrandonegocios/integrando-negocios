import Image from "next/image";
import Link from "next/link";

export function PasswordPage({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="grid min-h-svh place-items-center bg-background-secondary p-5"><section className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-xl shadow-text-primary/5 sm:p-10"><Image alt="Integrando Negócios" className="h-14 w-auto" height={220} src="/logo.png" width={460} priority /><p className="mt-8 text-sm font-bold uppercase tracking-[.16em] text-brand-accent">Segurança da conta</p><h1 className="mt-2 text-3xl font-bold text-text-primary">{title}</h1><p className="mt-2 text-text-secondary">{description}</p>{children}<Link className="mt-6 block text-center text-sm font-semibold underline" href="/login">Voltar para o login</Link></section></main>;
}
