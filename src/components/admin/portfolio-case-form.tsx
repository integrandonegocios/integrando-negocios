"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { savePortfolioCase, type PortfolioCaseFormState } from "@/actions/admin";

const initialState: PortfolioCaseFormState = { status: "idle", message: "" };
const field = "w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileBytes = 5 * 1024 * 1024;

type EditablePortfolioCase = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  imageUrl: string | null;
  galleryUrls: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export function PortfolioCaseForm({ project }: { project?: EditablePortfolioCase }) {
  const [state, formAction, pending] = useActionState(savePortfolioCase, initialState);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [clientError, setClientError] = useState("");
  const objectUrlsRef = useRef<string[]>([]);
  const existingPreviewUrls = [project?.imageUrl, ...(project?.galleryUrls ?? [])].filter((url): url is string => Boolean(url));
  const displayedPreviewUrls = previewUrls.length ? previewUrls : existingPreviewUrls;

  const clearPreview = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setPreviewUrls([]);
  };

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const selectFiles = (files: File[]) => {
    clearPreview();
    setClientError("");
    if (files.length === 0) return true;
    if (files.length > 3) {
      setClientError("Selecione no máximo 3 imagens por projeto.");
      return false;
    }
    if (files.some((file) => !acceptedTypes.has(file.type))) {
      setClientError("Selecione uma imagem JPG, PNG ou WebP.");
      return false;
    }
    if (files.some((file) => file.size > maxFileBytes)) {
      setClientError("Cada imagem deve ter no máximo 5 MB.");
      return false;
    }
    objectUrlsRef.current = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(objectUrlsRef.current);
    return true;
  };

  return (
    <form action={formAction} className="mt-5 grid gap-5">
      {project && <input name="id" type="hidden" value={project.id} />}
      <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
        Título
        <input className={field} defaultValue={project?.title} name="title" required />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
        Resumo
        <textarea className={field} defaultValue={project?.summary} name="summary" required rows={3} />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
        Conteúdo detalhado
        <textarea className={field} defaultValue={project?.content ?? ""} name="content" rows={5} />
      </label>

      <fieldset className="rounded-xl border border-border bg-background-secondary p-4 sm:p-5">
        <legend className="px-2 text-sm font-bold text-text-primary">Imagem do case</legend>
        <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
          <div className="grid content-start gap-4">
            <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
              Enviar imagens
              <input
                accept="image/jpeg,image/png,image/webp"
                className="block w-full cursor-pointer rounded-lg border border-border-strong bg-surface text-sm text-text-secondary file:mr-4 file:border-0 file:border-r file:border-border file:bg-brand-primary-subtle file:px-4 file:py-2.5 file:font-semibold file:text-brand-accent hover:file:bg-brand-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                multiple
                name="imageFiles"
                onChange={(event) => {
                  const valid = selectFiles(Array.from(event.currentTarget.files ?? []));
                  if (!valid) event.currentTarget.value = "";
                }}
                type="file"
              />
            </label>
            <p className="text-xs leading-5 text-text-muted">
              Até 3 imagens JPG, PNG ou WebP, com no máximo 5 MB cada.
              {project
                ? " Novos arquivos substituirão a galeria atual."
                : " Os arquivos selecionados têm prioridade sobre a URL manual."}
            </p>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[.12em] text-text-muted"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div>
            <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
              URL da imagem
              <input className={field} defaultValue={project?.imageUrl ?? ""} name="imageUrl" placeholder="https://..." type="url" />
            </label>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className={`grid min-h-48 gap-1 bg-background p-1 ${displayedPreviewUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {displayedPreviewUrls.length ? displayedPreviewUrls.map((previewUrl, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={`Pré-visualização da imagem ${index + 1}`} className={`size-full min-h-0 object-cover ${displayedPreviewUrls.length === 3 && index === 0 ? "col-span-2 aspect-[2/1]" : "aspect-[4/3]"}`} key={previewUrl} src={previewUrl} />
              )) : (
                <p className="grid min-h-44 place-items-center px-5 text-center text-xs leading-5 text-text-muted">As pré-visualizações aparecerão aqui.</p>
              )}
            </div>
            {previewUrls.length > 0 && <p className="border-t border-border px-3 py-2 text-center text-xs font-semibold text-brand-accent">{previewUrls.length} {previewUrls.length === 1 ? "imagem pronta" : "imagens prontas"} para envio</p>}
          </div>
        </div>
      </fieldset>

      <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
        Status
        <select className={field} defaultValue={project?.status ?? "DRAFT"} name="status">
          <option value="DRAFT">Rascunho</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>
      </label>

      {(clientError || state.message) && (
        <p aria-live="polite" className={`rounded-lg border px-4 py-3 text-sm ${clientError || state.status === "error" ? "border-status-danger/20 bg-status-danger-subtle text-status-danger" : "border-brand-primary-light bg-brand-primary-subtle text-text-primary"}`}>
          {clientError || state.message}
        </p>
      )}

      <div>
        <button className="rounded-lg bg-brand-primary px-5 py-2.5 font-semibold text-text-primary transition hover:bg-brand-primary-hover hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-wait disabled:opacity-60" disabled={pending || Boolean(clientError)} type="submit">
          {pending ? (previewUrls.length ? "Enviando imagens..." : "Salvando...") : project ? "Salvar alterações" : "Criar case"}
        </button>
      </div>
    </form>
  );
}
