"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { SubmitButton } from "./submit-button";

export function LoginForm() {
  const [state, action] = useActionState(login, {});
  return <form action={action} className="mt-8 space-y-5">
    <label className="block text-sm font-semibold">E-mail<input autoComplete="email" className="mt-2 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 font-normal outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20" name="email" required type="email" /></label>
    <label className="block text-sm font-semibold">Senha<input autoComplete="current-password" className="mt-2 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 font-normal outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20" minLength={8} name="password" required type="password" /></label>
    {state.error && <p className="rounded-lg bg-status-danger-subtle p-3 text-sm text-status-danger" role="alert">{state.error}</p>}
    <SubmitButton className="w-full" pendingLabel="Entrando...">Entrar</SubmitButton>
  </form>;
}
