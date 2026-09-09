"use client";

import { useActionState } from "react";
import { submitContact } from "@/actions/public";
import { SubmitButton } from "./submit-button";

const field = "mt-2 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-text-primary outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";

export function ContactForm() {
  const [state, action] = useActionState(submitContact, {});
  if (state.success) return <div className="rounded-2xl border border-brand-primary-light bg-brand-primary-subtle p-8 text-center"><h2 className="text-2xl font-bold text-text-primary">Mensagem recebida</h2><p className="mt-2 text-text-secondary">Obrigado pelo contato. Nossa equipe responderá em breve.</p></div>;
  return <form action={action} className="grid gap-5 sm:grid-cols-2">
    <label className="text-sm font-semibold">Nome<input className={field} name="name" required /></label>
    <label className="text-sm font-semibold">E-mail<input className={field} name="email" required type="email" /></label>
    <label className="text-sm font-semibold">Telefone<input className={field} name="phone" /></label>
    <label className="text-sm font-semibold">Empresa<input className={field} name="company" /></label>
    <label aria-hidden="true" className="hidden">Website<input name="website" tabIndex={-1} /></label>
    <label className="text-sm font-semibold sm:col-span-2">Como podemos ajudar?<textarea className={field} minLength={10} name="message" required rows={6} /></label>
    {state.error && <p className="text-sm text-status-danger sm:col-span-2" role="alert">{state.error}</p>}
    <div className="sm:col-span-2"><SubmitButton pendingLabel="Enviando...">Enviar mensagem</SubmitButton></div>
  </form>;
}
