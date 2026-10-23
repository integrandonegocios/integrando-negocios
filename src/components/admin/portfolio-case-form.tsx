"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { getPortfolioImageUploadSignatures, savePortfolioCase, type PortfolioCaseFormState } from "@/actions/admin";

const initialState: PortfolioCaseFormState = { status: "idle", message: "" };
const field = "w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileBytes = 5 * 1024 * 1024;
const maxTotalImages = 4;

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
  const [coverIndex, setCoverIndex] = useState(0);
  const [clientError, setClientError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);
  const existingPreviewUrls = [project?.imageUrl, ...(project?.galleryUrls ?? [])].filter((url): url is string => Boolean(url));
  const displayedPreviewUrls = previewUrls.length ? previewUrls : existingPreviewUrls;
  const currentCoverIndex = Math.min(Math.max(coverIndex, 0), Math.max(displayedPreviewUrls.length - 1, 0));

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
    if (files.length > maxTotalImages) {
      setClientError("Selecione no máximo 4 imagens por projeto: 1 capa e 3 fotos adicionais.");
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
    setCoverIndex(0);
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("imageFiles");
    const files = fileInput instanceof HTMLInputElement ? Array.from(fileInput.files ?? []) : [];
    if (files.length === 0) return;

    event.preventDefault();
    setClientError("");
    setUploadingImages(true);

    try {
      const signatures = await getPortfolioImageUploadSignatures(files.length);
      const imageUrls = await Promise.all(files.map(async (file, index) => {
        const signedUpload = signatures[index];
        if (!signedUpload) throw new Error("Não foi possível preparar o envio das imagens.");

        const body = new FormData();
        body.set("file", file);
        body.set("api_key", signedUpload.apiKey);
        body.set("timestamp", signedUpload.timestamp);
        body.set("public_id", signedUpload.publicId);
        body.set("allowed_formats", signedUpload.allowedFormats);
        body.set("signature", signedUpload.signature);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signedUpload.cloudName)}/image/upload`, {
          method: "POST",
          body,
        });
        const result = await response.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };
        if (!response.ok || !result.secure_url || result.public_id !== signedUpload.publicId) {
          throw new Error(result.error?.message || "Não foi possível enviar uma das imagens. Tente novamente.");
        }
        return result.secure_url;
      }));

      const formData = new FormData(form);
      formData.delete("imageFiles");
      formData.delete("uploadedImageUrls");
      imageUrls.forEach((url) => formData.append("uploadedImageUrls", url));
      formAction(formData);
    } catch (error) {
      setClientError(error instanceof Error ? error.message : "Não foi possível enviar as imagens. Tente novamente.");
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <form action={formAction} className="mt-5 grid gap-5" onSubmit={handleSubmit}>
      {project && <input name="id" type="hidden" value={project.id} />}
      <input name="coverIndex" type="hidden" value={currentCoverIndex} />
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
              Até 4 imagens JPG, PNG ou WebP no total: 1 capa + 3 fotos adicionais, com no máximo 5 MB cada.
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
            <div className={`grid min-h-48 gap-2 bg-background p-2 ${displayedPreviewUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {displayedPreviewUrls.length ? displayedPreviewUrls.map((previewUrl, index) => (
                <div className="relative overflow-hidden rounded-lg border border-border bg-surface" key={previewUrl}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={`Pré-visualização da imagem ${index + 1}`} className="aspect-[4/3] size-full min-h-0 object-cover" src={previewUrl} />
                  <button
                    aria-pressed={index === currentCoverIndex}
                    className={`absolute inset-x-2 bottom-2 inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition ${index === currentCoverIndex ? "bg-brand-primary text-text-primary" : "bg-surface-inverse/80 text-text-inverse"}`}
                    onClick={() => setCoverIndex(index)}
                    type="button"
                  >
                    {index === currentCoverIndex ? "Capa" : "Usar como capa"}
                  </button>
                </div>
              )) : (
                <p className="grid min-h-44 place-items-center px-5 text-center text-xs leading-5 text-text-muted">As pré-visualizações aparecerão aqui.</p>
              )}
            </div>
            {(previewUrls.length > 0 || displayedPreviewUrls.length > 0) && (
              <p className="border-t border-border px-3 py-2 text-center text-xs font-semibold text-brand-accent">
                {displayedPreviewUrls.length} {displayedPreviewUrls.length === 1 ? "imagem selecionada" : "imagens selecionadas"} · capa: {currentCoverIndex + 1}
              </p>
            )}
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
          {uploadingImages ? "Enviando imagens..." : pending ? "Salvando..." : project ? "Salvar alterações" : "Criar case"}
        </button>
      </div>
    </form>
  );
}
