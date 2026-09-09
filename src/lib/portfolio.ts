import "server-only";

import { db } from "@/lib/db";
import type { PortfolioProject } from "@/components/home/portfolio-showcase";

export async function getPublishedPortfolioProjects(limit?: number): Promise<PortfolioProject[]> {
  const items = await db.portfolioCase.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    ...(limit === undefined ? {} : { take: limit }),
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    category: "Sites",
    eyebrow: "Case publicado",
    description: item.summary,
    services: ["Estratégia", "Design", "Tecnologia"],
    image: item.imageUrl ?? undefined,
    imageAlt: `Apresentação do projeto ${item.title}`,
    gallery: item.galleryUrls.map((image, index) => ({
      image,
      imageAlt: `${item.title}, imagem ${index + 2}`,
    })),
    href: item.imageUrl ?? undefined,
  }));
}
