"use client";

import { deletePortfolioCase } from "@/actions/admin";

export function DeletePortfolioCaseButton({ id, title }: { id: string; title: string }) {
  return (
    <form action={deletePortfolioCase} onSubmit={(event) => {
      if (!window.confirm(`Excluir o projeto “${title}”? Esta ação não pode ser desfeita.`)) event.preventDefault();
    }}>
      <input name="id" type="hidden" value={id} />
      <button className="rounded-lg border border-status-danger/25 px-4 py-2.5 text-sm font-bold text-status-danger transition hover:bg-status-danger-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-status-danger" type="submit">Excluir projeto</button>
    </form>
  );
}
