import Link from "next/link";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata = { title: "Contato", description: "Converse com a Integrando Negócios sobre seu próximo projeto digital." };

export default function ContactPage() {
  return <main className="min-h-svh bg-background"><header className="border-b border-border bg-surface"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"><Link className="font-bold text-text-primary transition hover:text-brand-primary-hover" href="/">← Integrando Negócios</Link><Link className="text-sm font-semibold text-brand-primary-hover" href="/login">Área interna</Link></div></header><div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-24"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-brand-accent">Contato</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">Vamos construir o próximo passo.</h1><p className="mt-5 text-lg leading-8 text-text-secondary">Conte um pouco sobre sua empresa e o desafio que deseja resolver.</p></div><div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10"><ContactForm /></div></div></main>;
}
