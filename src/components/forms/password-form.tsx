"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { changePassword, requestPasswordReset, resetPassword } from "@/actions/password";
import { resetTokenSchema } from "@/lib/validation";
import { SubmitButton } from "./submit-button";

export function PasswordForm({ mode }: { mode: "change" | "forgot" | "reset" }) {
  const [state, action] = useActionState(mode === "change" ? changePassword : mode === "forgot" ? requestPasswordReset : resetPassword, {});
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (mode !== "reset") return;
    const frame = window.requestAnimationFrame(() => {
      const value = new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
      setToken(value);
      window.history.replaceState(null, "", window.location.pathname);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mode]);
  const inputClass = "mt-2 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 font-normal outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
  if (mode === "reset" && token === null) return <p className="mt-6" role="status">Preparando formulário...</p>;
  if (mode === "reset" && !resetTokenSchema.safeParse(token).success) return <div className="mt-6 space-y-4"><p role="alert">Link inválido ou expirado. Solicite uma nova recuperação.</p><Link className="font-semibold underline" href="/esqueci-senha">Solicitar novo link</Link></div>;
  return <form action={action} className="mt-8 space-y-5">
    {mode === "reset" && <input name="token" type="hidden" value={token || ""} />}
    {mode === "forgot" ? <label className="block text-sm font-semibold">E-mail<input className={inputClass} name="email" type="email" autoComplete="email" maxLength={254} required /></label> : <>
      {mode === "change" && <label className="block text-sm font-semibold">Senha atual<input className={inputClass} name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required /></label>}
      <p id="password-help" className="text-sm text-text-secondary">Use entre 12 e 128 caracteres para a nova senha.</p>
      <label className="block text-sm font-semibold">Nova senha<input className={inputClass} name="newPassword" type="password" autoComplete="new-password" aria-describedby="password-help" minLength={12} maxLength={128} required /></label>
      <label className="block text-sm font-semibold">Confirmar nova senha<input className={inputClass} name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
    </>}
    {state.error && <p className="rounded-lg bg-status-danger-subtle p-3 text-sm text-status-danger" role="alert">{state.error}</p>}
    {state.success && <p className="rounded-lg bg-brand-primary-subtle p-3 text-sm" role="status">{state.success}</p>}
    <SubmitButton className="w-full" pendingLabel={mode === "forgot" ? "Enviando..." : "Salvando..."}>{mode === "forgot" ? "Enviar instruções" : mode === "change" ? "Alterar senha" : "Redefinir senha"}</SubmitButton>
    {mode === "reset" && <Link className="block text-sm font-semibold underline" href="/esqueci-senha">Solicitar novo link</Link>}
  </form>;
}
