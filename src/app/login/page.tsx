import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = { title: "Acesso interno" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/admin");
  return <main className="grid min-h-svh place-items-center bg-background-secondary p-5"><section className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-xl shadow-text-primary/5 sm:p-10"><Image alt="Integrando Negócios" className="h-14 w-auto" height={220} src="/logo.png" width={460} priority /><p className="mt-8 text-sm font-bold uppercase tracking-[.16em] text-brand-accent">Área interna</p><h1 className="mt-2 text-3xl font-bold text-text-primary">Acesse sua conta</h1><p className="mt-2 text-text-secondary">Use as credenciais fornecidas pelo administrador.</p><LoginForm /></section></main>;
}
