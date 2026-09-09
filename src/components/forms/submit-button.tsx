"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingLabel = "Salvando...", className = "" }: { children: React.ReactNode; pendingLabel?: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button className={`rounded-lg bg-brand-primary px-4 py-2.5 font-semibold text-text-primary transition hover:bg-brand-primary-hover hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-wait disabled:opacity-60 ${className}`} disabled={pending} type="submit">{pending ? pendingLabel : children}</button>;
}
