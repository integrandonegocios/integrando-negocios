"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { getPortfolioImageUploadSignatures, savePortfolioCase, type PortfolioCaseFormState } from "@/actions/admin";

const initialState: PortfolioCaseFormState = { status: "idle", message: "" };
const field = "w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileBytes = 5 * 1024 * 1024;
const maxSlideshowImages = 3;
const coverDimensions = { width: 1600, height: 1200 };
const slideshowDimensions = { width: 1672, height: 941 };

type EditablePortfolioCase = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  imageUrl: string | null;
  slideshowImageUrl: string | null;
  galleryUrls: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

async function preparePortfolioImage(
  file: File,
  dimensions: typeof coverDimensions | typeof slideshowDimensions,
) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  try {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível processar uma das imagens.");

    const scale = Math.max(dimensions.width / bitmap.width, dimensions.height / bitmap.height);
    const width = bitmap.width * scale;
    const height = bitmap.height * scale;
    const x = (dimensions.width - width) / 2;
    const y = (dimensions.height - height) / 2;
    context.drawImage(bitmap, x, y, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) {
          reject(new Error("Não foi possível processar uma das imagens."));
          return;
        }
        resolve(result);
      }, "image/webp", 0.9);
    });

    if (blob.type !== "image/webp") {
      throw new Error("Este navegador não oferece suporte ao formato WebP necessário para preparar as imagens.");
    }
    if (blob.size > maxFileBytes) {
      throw new Error("Uma imagem excedeu 5 MB após o redimensionamento. Use uma imagem original menor.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "portfolio";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}

export function PortfolioCaseForm({ project }: { project?: EditablePortfolioCase }) {
  const [state, formAction, pending] = useActionState(savePortfolioCase, initialState);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [slideshowPreviewUrls, setSlideshowPreviewUrls] = useState<string[]>([]);
  const [clientError, setClientError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const coverObjectUrlRef = useRef<string | null>(null);
  const slideshowObjectUrlsRef = useRef<string[]>([]);
  const existingSlideshowUrls = [project?.slideshowImageUrl, ...(project?.galleryUrls ?? [])].filter((url): url is string => Boolean(url));
  const displayedCoverUrl = coverPreviewUrl ?? project?.imageUrl ?? null;
  const displayedSlideshowUrls = slideshowPreviewUrls.length ? slideshowPreviewUrls : existingSlideshowUrls;

  const clearCoverPreview = () => {
    if (coverObjectUrlRef.current) URL.revokeObjectURL(coverObjectUrlRef.current);
    coverObjectUrlRef.current = null;
    setCoverPreviewUrl(null);
  };

  const clearSlideshowPreview = () => {
    slideshowObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    slideshowObjectUrlsRef.current = [];
    setSlideshowPreviewUrls([]);
  };

  useEffect(() => () => {
    if (coverObjectUrlRef.current) URL.revokeObjectURL(coverObjectUrlRef.current);
    slideshowObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const selectCoverFile = (file: File | undefined) => {
    clearCoverPreview();
    setClientError("");
    if (!file) return true;
    if (!acceptedTypes.has(file.type)) {
      setClientError("Selecione uma imagem de capa JPG, PNG ou WebP.");
      return false;
    }
    if (file.size > maxFileBytes) {
      setClientError("A imagem de capa deve ter no máximo 5 MB.");
      return false;
    }
    coverObjectUrlRef.current = URL.createObjectURL(file);
    setCoverPreviewUrl(coverObjectUrlRef.current);
    return true;
  };

  const selectSlideshowFiles = (files: File[]) => {
    clearSlideshowPreview();
    setClientError("");
    if (files.length === 0) return true;
    if (files.length > maxSlideshowImages) {
      setClientError("Selecione no máximo 3 artes para o slideshow.");
      return false;
    }
    if (files.some((file) => !acceptedTypes.has(file.type))) {
      setClientError("Selecione artes JPG, PNG ou WebP.");
      return false;
    }
    if (files.some((file) => file.size > maxFileBytes)) {
      setClientError("Cada arte do slideshow deve ter no máximo 5 MB.");
      return false;
    }
    slideshowObjectUrlsRef.current = files.map((file) => URL.createObjectURL(file));
    setSlideshowPreviewUrls(slideshowObjectUrlsRef.current);
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const coverInput = form.elements.namedItem("coverImageFile");
    const slideshowInput = form.elements.namedItem("slideshowImageFiles");
    const coverFile = coverInput instanceof HTMLInputElement ? coverInput.files?.[0] : undefined;
    const slideshowFiles = slideshowInput instanceof HTMLInputElement ? Array.from(slideshowInput.files ?? []) : [];
    if (!coverFile && slideshowFiles.length === 0) return;

    event.preventDefault();
    setClientError("");
    setUploadingImages(true);

    try {
      const processedCover = coverFile ? await preparePortfolioImage(coverFile, coverDimensions) : null;
      const processedSlides = await Promise.all(slideshowFiles.map((file) => preparePortfolioImage(file, slideshowDimensions)));
      const processedFiles = [...(processedCover ? [processedCover] : []), ...processedSlides];
      const signatures = await getPortfolioImageUploadSignatures(processedFiles.length);
      const imageUrls = await Promise.all(processedFiles.map(async (file, index) => {
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
      formData.delete("coverImageFile");
      formData.delete("slideshowImageFiles");
      formData.delete("uploadedCoverImageUrl");
      formData.delete("uploadedSlideshowImageUrls");
      let imageUrlIndex = 0;
      if (processedCover) {
        const uploadedCoverImageUrl = imageUrls[imageUrlIndex++];
        if (!uploadedCoverImageUrl) throw new Error("Não foi possível concluir o envio da capa.");
        formData.set("uploadedCoverImageUrl", uploadedCoverImageUrl);
      }
      imageUrls.slice(imageUrlIndex).forEach((url) => formData.append("uploadedSlideshowImageUrls", url));
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
        <legend className="px-2 text-sm font-bold text-text-primary">Capa e artes do slideshow</legend>
        <div className="grid gap-6">
          <div className="grid content-start gap-4">
            <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
              Imagem da capa do projeto (card)
              <input
                accept="image/jpeg,image/png,image/webp"
                className="block w-full cursor-pointer rounded-lg border border-border-strong bg-surface text-sm text-text-secondary file:mr-4 file:border-0 file:border-r file:border-border file:bg-brand-primary-subtle file:px-4 file:py-2.5 file:font-semibold file:text-brand-accent hover:file:bg-brand-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                name="coverImageFile"
                disabled={uploadingImages || pending}
                onChange={(event) => {
                  const valid = selectCoverFile(event.currentTarget.files?.[0]);
                  if (!valid) event.currentTarget.value = "";
                }}
                type="file"
              />
            </label>
            <p className="text-xs leading-5 text-text-muted">A capa do card é independente do slideshow e será preparada em 1600 × 1200 px (4:3), com no máximo 5 MB.</p>
            <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
              URL manual da capa (opcional)
              <input className={field} defaultValue={project?.imageUrl ?? ""} name="imageUrl" placeholder="https://..." type="url" />
            </label>
          </div>

          <div className="grid gap-4 border-t border-border pt-5">
            <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
              Artes do slideshow (até 3, separadas da capa)
              <input
                accept="image/jpeg,image/png,image/webp"
                className="block w-full cursor-pointer rounded-lg border border-border-strong bg-surface text-sm text-text-secondary file:mr-4 file:border-0 file:border-r file:border-border file:bg-brand-primary-subtle file:px-4 file:py-2.5 file:font-semibold file:text-brand-accent hover:file:bg-brand-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                multiple
                name="slideshowImageFiles"
                disabled={uploadingImages || pending}
                onChange={(event) => {
                  const valid = selectSlideshowFiles(Array.from(event.currentTarget.files ?? []));
                  if (!valid) event.currentTarget.value = "";
                }}
                type="file"
              />
            </label>
            <p className="text-xs leading-5 text-text-muted">
              Envie artes próprias em 1672 × 941 px (16:9) para ocupar todo o slide sem barras pretas. Imagens em outra proporção serão preenchidas e podem ter as bordas cortadas. Cada arquivo pode ter até 5 MB.
              {project ? " Ao enviar novas artes, elas substituirão as atuais. Reenvie os originais para corrigir slides antigos." : ""}
            </p>
            {displayedCoverUrl && (
              <div className="max-w-sm">
                <p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-text-muted">Prévia da capa do card (4:3)</p>
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="Prévia da capa do projeto" className="aspect-[4/3] w-full object-cover" src={displayedCoverUrl} />
                </div>
              </div>
            )}
            {displayedSlideshowUrls.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-text-muted">Prévia das artes do slideshow (16:9)</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedSlideshowUrls.map((previewUrl, index) => (
                    <div className="overflow-hidden rounded-lg border border-border bg-surface" key={`${previewUrl}-${index}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={`Prévia da arte do slideshow ${index + 1}`} className="aspect-video w-full object-cover" src={previewUrl} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {displayedSlideshowUrls.length === 0 && (
              <p className="text-xs text-text-muted">Nenhuma arte de slideshow cadastrada. A capa não será adicionada automaticamente à apresentação.</p>
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
        <button className="rounded-lg bg-brand-primary px-5 py-2.5 font-semibold text-text-primary transition hover:bg-brand-primary-hover hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-wait disabled:opacity-60" disabled={uploadingImages || pending || Boolean(clientError)} type="submit">
          {uploadingImages ? "Preparando e enviando imagens..." : pending ? "Salvando..." : project ? "Salvar alterações" : "Criar case"}
        </button>
      </div>
    </form>
  );
}
