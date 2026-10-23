import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { PortfolioProjectGallery } from "@/components/home/portfolio-project-gallery";
import { getPublishedPortfolioProject } from "@/lib/portfolio";
import { canonical } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }> };

const getProject = cache(async (slug: string) => {
  await connection();
  return getPublishedPortfolioProject(slug);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) notFound();

  return {
    title: project.title,
    description: project.description.slice(0, 160),
    alternates: canonical(`/projetos/${project.slug}`),
  };
}

export default async function PortfolioProjectPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();

  const images = [
    ...(project.image ? [{ image: project.image, imageAlt: project.imageAlt }] : []),
    ...(project.gallery ?? []).map(({ image, imageAlt }) => ({ image, imageAlt })),
  ];

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[70svh] max-w-7xl px-5 pb-20 pt-36 sm:px-8 sm:pt-40">
        <Link className="inline-flex rounded-md font-semibold text-brand-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary" href="/projetos">
          ← Todos os projetos
        </Link>
        <div className="mx-auto mt-8 max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-accent">Projeto</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-[-.04em] text-text-primary sm:text-5xl">{project.title}</h1>
          <p className="mt-5 text-lg leading-8 text-text-secondary">{project.description}</p>
          {project.content && <p className="mt-4 whitespace-pre-wrap leading-7 text-text-secondary">{project.content}</p>}
          <div className="mt-10">
            {images.length > 0
              ? <PortfolioProjectGallery images={images} />
              : <div className="grid aspect-video place-items-center rounded-xl bg-background-secondary text-text-muted">Este projeto ainda não tem imagens.</div>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
