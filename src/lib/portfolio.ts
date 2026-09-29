import "server-only";

import { db } from "@/lib/db";
import type { PortfolioProject } from "@/components/home/portfolio-showcase";

export async function getPublishedPortfolioProjects(limit?: number, offset = 0): Promise<PortfolioProject[]> {
  const items = await db.portfolioCase.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    ...(limit === undefined ? {} : { take: limit }),
    skip: offset,
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.summary,
    content: item.content ?? undefined,
    image: item.imageUrl ?? undefined,
    imageAlt: `Apresentação do projeto ${item.title}`,
    gallery: item.galleryUrls.map((image, index) => ({
      image,
      imageAlt: `${item.title}, imagem ${index + 2}`,
    })),
    href: item.imageUrl ?? undefined,
  }));
}
