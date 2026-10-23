"use client";

import { useState } from "react";

type PortfolioGalleryImage = { image: string; imageAlt: string };

export function PortfolioProjectGallery({ images }: { images: PortfolioGalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  if (!activeImage) {
    return <div className="grid aspect-video place-items-center rounded-xl bg-background-secondary text-text-muted">Imagens do projeto indisponíveis.</div>;
  }

  const previousImage = () => setActiveIndex((current) => (current - 1 + images.length) % images.length);
  const nextImage = () => setActiveIndex((current) => (current + 1) % images.length);

  return (
    <div>
      <div className="relative grid aspect-video place-items-center overflow-hidden rounded-xl border border-border bg-surface-inverse-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={activeImage.imageAlt} className="size-full object-cover" fetchPriority="high" src={activeImage.image} />
        {images.length > 1 && (
          <>
            <button aria-label="Imagem anterior" className="absolute left-3 grid size-11 place-items-center rounded-full bg-surface-inverse/80 text-xl text-text-inverse transition hover:bg-surface-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" onClick={previousImage} type="button">←</button>
            <button aria-label="Próxima imagem" className="absolute right-3 grid size-11 place-items-center rounded-full bg-surface-inverse/80 text-xl text-text-inverse transition hover:bg-surface-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" onClick={nextImage} type="button">→</button>
            <span aria-live="polite" className="absolute bottom-3 rounded-full bg-surface-inverse/80 px-3 py-1 text-sm font-semibold text-text-inverse">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div aria-label="Selecionar imagem do projeto" className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6" role="group">
          {images.map((image, index) => (
            <button
              aria-label={`Ver imagem ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={`relative aspect-video overflow-hidden rounded-lg border-2 bg-surface-inverse-deep transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${index === activeIndex ? "border-brand-primary" : "border-border hover:border-brand-primary/60"}`}
              key={`${image.image}-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="size-full object-cover" loading="lazy" src={image.image} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
