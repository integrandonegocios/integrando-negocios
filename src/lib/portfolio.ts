import "server-only";

import { db } from "@/lib/db";
import type { PortfolioProject } from "@/components/home/portfolio-showcase";

function toPortfolioProject(item: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string | null;
  imageUrl: string | null;
  slideshowImageUrl: string | null;
  galleryUrls: string[];
}): PortfolioProject {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.summary,
    content: item.content ?? undefined,
    image: item.imageUrl ?? undefined,
    slideshowImage: item.slideshowImageUrl ?? undefined,
    imageAlt: `Apresentação do projeto ${item.title}`,
    gallery: item.galleryUrls.map((image, index) => ({
      image,
      imageAlt: `${item.title}, imagem ${index + 2}`,
    })),
    href: `/projetos/${item.slug}`,
  };
}

export async function getPublishedPortfolioProjects(limit?: number, offset = 0): Promise<PortfolioProject[]> {
  const items = await db.portfolioCase.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    ...(limit === undefined ? {} : { take: limit }),
    skip: offset,
  });

  return items.map(toPortfolioProject);
}

export async function getPublishedPortfolioProject(slug: string): Promise<PortfolioProject | null> {
  const item = await db.portfolioCase.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true, slug: true, title: true, summary: true, content: true, imageUrl: true, slideshowImageUrl: true, galleryUrls: true },
  });

  return item ? toPortfolioProject(item) : null;
}
