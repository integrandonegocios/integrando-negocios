"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type PortfolioProject = {
  id: string;
  title: string;
  category: "Sites" | "Marketing" | "Design" | "Sistemas" | "Inteligência Artificial";
  eyebrow: string;
  description: string;
  services: string[];
  image?: string;
  imageAlt: string;
  imagePosition?: string;
  gallery?: Array<{ image: string; imageAlt: string; imagePosition?: string }>;
  href?: string;
  layout?: "featured" | "portrait" | "wide";
};

function ProjectImage({ image, imageAlt, imagePosition, lightbox = false }: { image?: string; imageAlt: string; imagePosition?: string; lightbox?: boolean }) {
  if (!image) {
    return <div className="absolute inset-0 grid place-items-center bg-background-secondary text-sm font-semibold text-text-muted">Projeto em destaque</div>;
  }

  const imageClass = lightbox
    ? "object-contain"
    : `object-cover transition duration-300 ease-out group-hover:scale-[1.025] ${imagePosition ?? "object-center"}`;

  return image.startsWith("/") ? (
    <Image alt={imageAlt} className={imageClass} fill sizes={lightbox ? "90vw" : "(max-width: 1023px) 100vw, 25vw"} src={image} />
  ) : (
    // External URLs can come from the production storage provider or the manual URL field.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={imageAlt} className={`size-full ${imageClass}`} decoding="async" loading={lightbox ? "eager" : "lazy"} src={image} />
  );
}

function ProjectCard({ project, onOpen }: { project: PortfolioProject; onOpen?: () => void }) {
  const image = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-background-secondary">
      <ProjectImage image={project.image} imageAlt={project.imageAlt} imagePosition={project.imagePosition} />
    </div>
  );

  return (
    <article className="group transition duration-300 hover:-translate-y-0.5">
      {onOpen && project.image ? (
        <button aria-label={`Abrir galeria do projeto ${project.title}`} className="block w-full rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary" onClick={onOpen} type="button">
          {image}
        </button>
      ) : project.href ? (
        <a aria-label={`Ver projeto ${project.title}`} className="block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary" href={project.href} target="_blank" rel="noreferrer">
          {image}
        </a>
      ) : image}
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-text-primary">{project.title}</h3>
    </article>
  );
}

export function PortfolioShowcase({ managedProjects, limit, columns = 3, enableLightbox = false }: { managedProjects: PortfolioProject[]; limit?: number; columns?: 3 | 4; enableLightbox?: boolean }) {
  const visibleProjects = typeof limit === "number" ? managedProjects.slice(0, limit) : managedProjects;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const selectedProject = lightboxIndex === null ? undefined : visibleProjects[lightboxIndex];
  const selectedImages = selectedProject?.image
    ? [{ image: selectedProject.image, imageAlt: selectedProject.imageAlt, imagePosition: selectedProject.imagePosition }, ...(selectedProject.gallery ?? [])]
    : [];
  const imageCount = selectedImages.length;
  const selectedImage = selectedImages[imageIndex];

  const previousImage = () => setImageIndex((current) => (current - 1 + imageCount) % imageCount);
  const nextImage = () => setImageIndex((current) => (current + 1) % imageCount);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft" && imageCount > 1) setImageIndex((current) => (current - 1 + imageCount) % imageCount);
      if (event.key === "ArrowRight" && imageCount > 1) setImageIndex((current) => (current + 1) % imageCount);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageCount, lightboxIndex]);

  return (
    <div>
      {visibleProjects.length === 0 && <p className="text-text-secondary">Nenhum projeto publicado no momento.</p>}
      <div className={`grid gap-5 md:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {visibleProjects.map((project, index) => <ProjectCard key={project.id} onOpen={enableLightbox ? () => { setImageIndex(0); setLightboxIndex(index); } : undefined} project={project} />)}
      </div>

      {selectedProject && selectedImage && (
        <div aria-label={`Galeria do projeto ${selectedProject.title}`} aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-surface-inverse/95 p-4 sm:p-8" onClick={() => setLightboxIndex(null)} role="dialog">
          <div className="relative flex h-full max-h-[56rem] w-full max-w-7xl flex-col" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-5 text-text-inverse">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-brand-primary">Projeto</p>
                <h2 className="mt-1 text-lg font-semibold sm:text-xl">{selectedProject.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums text-text-inverse-muted">{imageIndex + 1} / {imageCount}</span>
                <button autoFocus aria-label="Fechar galeria" className="grid size-11 place-items-center rounded-full border border-text-inverse/20 text-xl text-text-inverse transition hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" onClick={() => setLightboxIndex(null)} type="button">×</button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-md bg-surface-inverse-deep">
              <ProjectImage image={selectedImage.image} imageAlt={selectedImage.imageAlt} imagePosition={selectedImage.imagePosition} lightbox />
            </div>

            {imageCount > 1 && (
              <div className="mt-4 flex justify-between gap-4">
                <button aria-label="Imagem anterior deste projeto" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-text-inverse/20 px-4 text-sm font-semibold text-text-inverse transition hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" onClick={previousImage} type="button">← Anterior</button>
                <button aria-label="Próxima imagem deste projeto" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-text-inverse/20 px-4 text-sm font-semibold text-text-inverse transition hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" onClick={nextImage} type="button">Próxima →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
